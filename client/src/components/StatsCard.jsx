export default function StatsCard({ icon, label, value, subValue, color = 'cyan' }) {
  const colorClasses = {
    cyan: 'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/20 text-neon-cyan',
    green: 'from-accent-400/20 to-accent-400/5 border-accent-400/20 text-accent-400',
    purple: 'from-neon-purple/20 to-neon-purple/5 border-neon-purple/20 text-neon-purple',
    yellow: 'from-neon-yellow/20 to-neon-yellow/5 border-neon-yellow/20 text-neon-yellow',
    pink: 'from-neon-pink/20 to-neon-pink/5 border-neon-pink/20 text-neon-pink',
    orange: 'from-neon-orange/20 to-neon-orange/5 border-neon-orange/20 text-neon-orange',
    blue: 'from-primary-400/20 to-primary-400/5 border-primary-400/20 text-primary-400',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colorClasses[color]} border transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {subValue && (
          <span className="text-[10px] font-medium text-dark-400 bg-dark-800/60 px-2 py-0.5 rounded-full">
            {subValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
      <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
