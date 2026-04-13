import { useAuth } from '../context/AuthContext';
import { formatDistance, formatArea, formatNumber, levelProgress } from '../utils/formatters';

// Achievement definitions (must match server)
const ACHIEVEMENTS = {
  first_step: { title: 'First Step', icon: '👣' },
  first_territory: { title: 'Landowner', icon: '🏴' },
  walk_1km: { title: 'Getting Started', icon: '🚶' },
  walk_10km: { title: 'Road Warrior', icon: '🏃' },
  walk_50km: { title: 'Marathon Spirit', icon: '🏅' },
  walk_100km: { title: 'Ultra Runner', icon: '🏆' },
  capture_5: { title: 'Raider', icon: '⚔️' },
  capture_25: { title: 'Conqueror', icon: '👑' },
  capture_100: { title: 'Empire Builder', icon: '🏰' },
  own_1_acre: { title: 'First Acre', icon: '🌍' },
  own_10_acres: { title: 'Landlord', icon: '🗺️' },
  streak_3: { title: 'On Fire', icon: '🔥' },
  streak_7: { title: 'Week Warrior', icon: '💥' },
  streak_30: { title: 'Unstoppable', icon: '⚡' },
  defend_5: { title: 'Guardian', icon: '🛡️' },
  level_5: { title: 'Rising Star', icon: '⭐' },
  level_10: { title: 'Veteran', icon: '🌟' },
  city_conqueror: { title: 'City Conqueror', icon: '🏙️' },
};

export default function Profile() {
  const { user } = useAuth();

  const allAchievements = Object.entries(ACHIEVEMENTS);
  const earnedSet = new Set(user?.achievements || []);
  const progress = levelProgress(user?.xp || 0, user?.level || 1);

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile header */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-primary-500/20">
                {user?.avatar || user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-dark-900 border-2 border-neon-cyan flex items-center justify-center text-xs font-bold text-neon-cyan">
                {user?.level || 1}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-display font-bold text-white">{user?.username}</h1>
              <p className="text-dark-400 text-sm">{user?.email}</p>
              {user?.city && (
                <p className="text-dark-500 text-xs mt-1">📍 {user.city}</p>
              )}

              {/* XP Bar */}
              <div className="mt-4 max-w-sm">
                <div className="flex justify-between text-xs text-dark-400 mb-1">
                  <span>Level {user?.level || 1}</span>
                  <span>{Math.round(progress)}% to Level {(user?.level || 1) + 1}</span>
                </div>
                <div className="xp-bar">
                  <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800/60 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-lg font-bold text-neon-cyan">{formatNumber(user?.xp || 0)}</p>
                <p className="text-[10px] text-dark-400">XP</p>
              </div>
              <div className="bg-dark-800/60 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-lg font-bold text-neon-yellow">{formatNumber(user?.coins || 0)}</p>
                <p className="text-[10px] text-dark-400">Coins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { icon: '🏃', label: 'Distance', value: formatDistance(user?.stats?.totalDistance || 0) },
            { icon: '🗺️', label: 'Land', value: formatArea(user?.stats?.totalLandOwned || 0) },
            { icon: '⚔️', label: 'Captures', value: formatNumber(user?.stats?.totalCaptures || 0) },
            { icon: '🛡️', label: 'Defenses', value: formatNumber(user?.stats?.totalDefenses || 0) },
            { icon: '🔥', label: 'Streak', value: `${user?.streak?.current || 0}d` },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <span className="text-2xl block mb-1">{stat.icon}</span>
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-dark-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🏅 Achievements
            <span className="badge-primary text-xs">
              {earnedSet.size}/{allAchievements.length}
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allAchievements.map(([id, ach]) => {
              const earned = earnedSet.has(id);
              return (
                <div
                  key={id}
                  className={`glass-card p-4 text-center transition-all ${
                    earned
                      ? 'border-accent-400/30 bg-accent-400/5'
                      : 'opacity-40 grayscale'
                  }`}
                >
                  <span className="text-3xl block mb-2">{ach.icon}</span>
                  <p className={`text-xs font-semibold ${earned ? 'text-white' : 'text-dark-500'}`}>
                    {ach.title}
                  </p>
                  {earned && (
                    <span className="text-[10px] text-accent-400 mt-1 block">✓ Earned</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active boosts/shields */}
        {(user?.activeShield?.active || user?.activeBoosts?.length > 0) && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">⚡ Active Effects</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {user?.activeShield?.active && new Date(user.activeShield.expiresAt) > new Date() && (
                <div className="glass-card p-4 border-neon-purple/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Shield Active</p>
                      <p className="text-xs text-dark-400">
                        Expires: {new Date(user.activeShield.expiresAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {user?.activeBoosts?.map((boost, i) => (
                new Date(boost.expiresAt) > new Date() && (
                  <div key={i} className="glass-card p-4 border-neon-yellow/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <p className="text-sm font-semibold text-white capitalize">
                          {boost.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-dark-400">
                          Expires: {new Date(boost.expiresAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
