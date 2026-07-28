import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, Home, Trophy, Users, User, LogOut, LogIn, Settings, Sun, Moon, ExternalLink, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children, isDarkMode, setIsDarkMode, themeColor }: {
  children: React.ReactNode;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  themeColor?: string;
}) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Asosiy' },
    { path: '/lessons', icon: GraduationCap, label: 'Darslar' },
    { path: '/leaderboard', icon: Trophy, label: 'Reyting' },
    { path: '/groups', icon: Users, label: 'Guruhlar', auth: true },
    { path: '/profile', icon: User, label: 'Profil', auth: true },
  ];

  if (profile?.isAdmin) {
    navItems.push({ path: '/settings', icon: Settings, label: 'Sozlamalar', auth: true });
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
          </>
        )}
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${isDarkMode ? 'border-white/5 bg-[#0a0a0f]/80' : 'border-gray-200 bg-white/80'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white/20" />
            </div>
            <span className="font-display font-black text-lg tracking-tighter hidden sm:block">SMARTMIZ</span>
          </NavLink>

          <div className="flex items-center gap-1">
            {navItems.map(item => {
              if (item.auth && !user) return null;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? (isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                        : (isDarkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100')
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.typingclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="TypingClub'ga o'tish"
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${isDarkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">TypingClub</span>
            </a>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Yorug‘ rejimga o‘tish' : 'Tungi rejimga o‘tish'}
              title={isDarkMode ? 'Yorug‘ rejim' : 'Tungi rejim'}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-white/40 hover:text-amber-300 hover:bg-white/5' : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500/30">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      {profile?.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-white/30 hover:text-rose-400 hover:bg-rose-500/10' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'}`}
                  title="Chiqish"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Kirish</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
