import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-400/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '3s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-900/60 backdrop-blur-sm border border-dark-700/50 mb-8 animate-fade-in">
            <div className="pulse-dot" />
            <span className="text-sm text-dark-300">Real-time GPS territory game</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[0.9] tracking-tight mb-6 animate-slide-up">
            <span className="text-white">Conquer the</span>
            <br />
            <span className="text-gradient text-shadow-glow">Real World</span>
          </h1>

          <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Walk, run, and claim real-world territory using GPS. Compete with others,
            defend your land, and rise through the ranks. Every step counts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="btn-primary text-lg px-8 py-4 shadow-2xl shadow-primary-500/20">
              Start Conquering →
            </Link>
            <Link to="/login" className="btn-ghost text-lg px-8 py-4">
              Already a warrior? Sign in
            </Link>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {[
              { icon: '🗺️', value: '∞', label: 'Territory to Claim' },
              { icon: '⚔️', value: 'Real-time', label: 'Territory Battles' },
              { icon: '🏆', value: 'Global', label: 'Leaderboards' },
              { icon: '🎯', value: 'Daily', label: 'Challenges' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center hover:bg-dark-800/40 transition-all duration-300">
                <span className="text-2xl block mb-2">{stat.icon}</span>
                <p className="text-xl font-bold text-gradient">{stat.value}</p>
                <p className="text-xs text-dark-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Simple concept, endless strategy. Walk to claim, run to capture, defend to dominate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📍',
                title: 'Track Your Movement',
                desc: 'GPS tracks your walking and running path in real-time. Every route becomes territory.',
                color: 'neon-cyan'
              },
              {
                icon: '🏴',
                title: 'Claim Territory',
                desc: 'Your path converts into territory tiles. The more you move, the more land you own.',
                color: 'accent-400'
              },
              {
                icon: '⚔️',
                title: 'Battle for Land',
                desc: 'Enter enemy territory to start a capture. Running gives you a speed advantage.',
                color: 'neon-pink'
              },
              {
                icon: '🛡️',
                title: 'Defend Your Empire',
                desc: 'Build defense levels and activate shields to protect your territory from invaders.',
                color: 'neon-purple'
              },
              {
                icon: '💰',
                title: 'Earn & Spend',
                desc: 'Earn coins from walking and winning battles. Buy boosts and shields in the shop.',
                color: 'neon-yellow'
              },
              {
                icon: '📈',
                title: 'Level Up',
                desc: 'Gain XP from every activity. Higher levels unlock faster captures and bigger influence.',
                color: 'neon-orange'
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card-hover p-6 group">
                <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                Ready to Claim Your Territory?
              </h2>
              <p className="text-dark-300 mb-8 max-w-lg mx-auto">
                Join the game, start moving, and build your virtual empire.
                Every step is a step towards domination.
              </p>
              <Link to="/register" className="btn-neon text-lg px-10 py-4 inline-block animate-glow">
                🏴 Join the Battle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-accent-400 flex items-center justify-center text-dark-950 text-xs font-bold">
              VT
            </div>
            <span className="text-sm text-dark-400">Virtual Territory © 2026</span>
          </div>
          <p className="text-xs text-dark-500">
            Built with 🏃 movement and 🎮 strategy in mind
          </p>
        </div>
      </footer>
    </div>
  );
}
