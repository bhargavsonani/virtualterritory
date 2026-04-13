import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { onlineCount, notifications } = useSocket();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { path: '/map', label: 'Map', icon: '🗺️' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/challenges', label: 'Challenges', icon: '🎯' },
    { path: '/shop', label: 'Shop', icon: '🛒' },
    { path: '/social', label: 'Social', icon: '👥' },
  ];

  const isActive = (path) => location.pathname === path;
  const unreadCount = notifications.filter(n => {
    const diff = Date.now() - new Date(n.timestamp).getTime();
    return diff < 300000; // Last 5 minutes
  }).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/map" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-accent-400 flex items-center justify-center text-dark-950 font-bold text-lg shadow-lg shadow-neon-cyan/20 group-hover:shadow-neon-cyan/40 transition-shadow">
              VT
            </div>
            <span className="font-display font-bold text-lg text-gradient hidden sm:inline">
              Virtual Territory
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-primary-500/15 text-primary-300 shadow-sm'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Online count */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-900/60 border border-dark-700/40">
              <div className="pulse-dot" />
              <span className="text-xs text-dark-300">{onlineCount} online</span>
            </div>

            {/* Coins */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-yellow/10 border border-neon-yellow/20">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-semibold text-neon-yellow">{user?.coins || 0}</span>
            </div>

            {/* Notifications indicator */}
            {unreadCount > 0 && (
              <div className="relative">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-dark-800/60 text-base cursor-pointer hover:bg-dark-700/60 transition-colors">
                  🔔
                </span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              </div>
            )}

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-dark-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.avatar || user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-white leading-tight">{user?.username}</p>
                  <p className="text-[10px] text-dark-400">Lv. {user?.level || 1}</p>
                </div>
                <svg className={`w-4 h-4 text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 animate-slide-down">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                  >
                    <span>👤</span> My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <div className="border-t border-dark-700/50 my-1" />
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-dark-800/50 transition-colors"
            >
              <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-dark-800/50 bg-dark-950/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-500/15 text-primary-300'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
