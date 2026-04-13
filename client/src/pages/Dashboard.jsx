import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import { formatDistance, formatArea, formatDuration, formatNumber } from '../utils/formatters';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/activity/stats?period=${period}`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 !bg-dark-900/95 !border-dark-700/60 text-xs">
          <p className="text-dark-400 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-semibold">
              {p.name}: {p.name === 'distance' ? formatDistance(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Your fitness and territory overview</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon="🏃"
            label="Total Distance"
            value={formatDistance(user?.stats?.totalDistance || 0)}
            color="cyan"
          />
          <StatsCard
            icon="🗺️"
            label="Land Owned"
            value={formatArea(user?.stats?.totalLandOwned || 0)}
            color="green"
          />
          <StatsCard
            icon="⚔️"
            label="Captures"
            value={formatNumber(user?.stats?.totalCaptures || 0)}
            color="pink"
          />
          <StatsCard
            icon="🔥"
            label="Streak"
            value={`${user?.streak?.current || 0} days`}
            color="orange"
          />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon="👟"
            label="Total Steps"
            value={formatNumber(user?.stats?.totalSteps || 0)}
            color="purple"
          />
          <StatsCard
            icon="🪙"
            label="Coins"
            value={formatNumber(user?.coins || 0)}
            color="yellow"
          />
          <StatsCard
            icon="⭐"
            label="Level"
            value={user?.level || 1}
            subValue={`${formatNumber(user?.xp || 0)} XP`}
            color="blue"
          />
          <StatsCard
            icon="🛡️"
            label="Defenses"
            value={formatNumber(user?.stats?.totalDefenses || 0)}
            color="cyan"
          />
        </div>

        {/* XP Progress Bar */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-neon-cyan/20">
                {user?.level || 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Level {user?.level || 1}</p>
                <p className="text-xs text-dark-400">{formatNumber(user?.xp || 0)} XP total</p>
              </div>
            </div>
            <p className="text-xs text-dark-400">
              Next level: {formatNumber(Math.floor(100 * Math.pow(user?.level || 1, 1.5)))} XP
            </p>
          </div>
          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{ width: `${user?.levelProgress?.progress * 100 || 30}%` }}
            />
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 mb-6">
          {['day', 'week', 'month', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Charts */}
        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Distance Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Distance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d424a" />
                  <XAxis
                    dataKey="date"
                    stroke="#787f8a"
                    fontSize={11}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis stroke="#787f8a" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="distance"
                    stroke="#00f5ff"
                    fillOpacity={1}
                    fill="url(#colorDist)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Steps Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Steps</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d424a" />
                  <XAxis
                    dataKey="date"
                    stroke="#787f8a"
                    fontSize={11}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis stroke="#787f8a" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="steps" fill="#39ff14" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Calories Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Calories Burned</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff006e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff006e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d424a" />
                  <XAxis dataKey="date" stroke="#787f8a" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#787f8a" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#ff006e"
                    fillOpacity={1}
                    fill="url(#colorCal)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {period.charAt(0).toUpperCase() + period.slice(1)} Summary
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Distance', value: formatDistance(stats?.totals?.distance || 0), icon: '🏃' },
                  { label: 'Total Steps', value: formatNumber(stats?.totals?.steps || 0), icon: '👟' },
                  { label: 'Calories Burned', value: `${stats?.totals?.calories || 0} cal`, icon: '🔥' },
                  { label: 'Sessions', value: stats?.totals?.sessions || 0, icon: '📍' },
                  { label: 'Total Duration', value: formatDuration(stats?.totals?.duration || 0), icon: '⏱️' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-dark-800/50 last:border-0">
                    <span className="flex items-center gap-3 text-sm text-dark-300">
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
