import { useState, useEffect } from 'react';
import { formatDistance, formatNumber, formatArea } from '../utils/formatters';
import api from '../api/axios';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global');
  const [metric, setMetric] = useState('totalLandOwned');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, metric]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let url = '/leaderboard/global';

      if (activeTab === 'weekly') {
        url = '/leaderboard/weekly';
      } else if (activeTab === 'city' && city) {
        url = `/leaderboard/city/${city}`;
      }

      const res = await api.get(url, { params: { metric } });
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-neon-yellow/20 to-transparent border-neon-yellow/30';
    if (rank === 2) return 'bg-gradient-to-r from-dark-300/10 to-transparent border-dark-300/20';
    if (rank === 3) return 'bg-gradient-to-r from-neon-orange/15 to-transparent border-neon-orange/20';
    return 'border-dark-800/30';
  };

  const getStatValue = (user) => {
    if (activeTab === 'weekly') {
      return formatDistance(user.weeklyDistance || 0);
    }
    switch (metric) {
      case 'totalLandOwned': return formatArea(user.stats?.totalLandOwned || 0);
      case 'totalDistance': return formatDistance(user.stats?.totalDistance || 0);
      case 'totalCaptures': return formatNumber(user.stats?.totalCaptures || 0);
      default: return '—';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            🏆 Leaderboard
          </h1>
          <p className="text-dark-400 mt-1">See who dominates the territory game</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['global', 'weekly', 'city'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50 border border-transparent'
              }`}
            >
              {tab === 'global' && '🌍 '}
              {tab === 'weekly' && '📅 '}
              {tab === 'city' && '🏙️ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* City search (for city tab) */}
        {activeTab === 'city' && (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="input-field flex-1"
            />
            <button onClick={fetchLeaderboard} className="btn-primary px-6">
              Search
            </button>
          </div>
        )}

        {/* Metric selector (not for weekly) */}
        {activeTab !== 'weekly' && (
          <div className="flex gap-2 mb-6">
            {[
              { key: 'totalLandOwned', label: '🗺️ Land' },
              { key: 'totalDistance', label: '🏃 Distance' },
              { key: 'totalCaptures', label: '⚔️ Captures' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  metric === m.key
                    ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
                    : 'text-dark-400 hover:text-white bg-dark-800/30'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard list */}
        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-3">🏜️</p>
            <p className="text-dark-400">No players found. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div
                key={player.id || index}
                className={`glass-card p-4 flex items-center gap-4 border transition-all hover:bg-dark-800/40 ${getRankStyle(player.rank)}`}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  <span className={`text-lg font-bold ${
                    player.rank <= 3 ? 'text-2xl' : 'text-dark-400'
                  }`}>
                    {getRankIcon(player.rank)}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {player.avatar || player.username?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{player.username}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400">Lv. {player.level}</span>
                    {player.city && (
                      <span className="text-xs text-dark-500">• {player.city}</span>
                    )}
                  </div>
                </div>

                {/* Stat */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gradient">{getStatValue(player)}</p>
                  <p className="text-[10px] text-dark-500 uppercase">
                    {activeTab === 'weekly' ? 'This Week' : metric.replace('total', '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
