import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, Trophy, LogOut, User, Gamepad2, Settings, History, Award, Home, Crown } from 'lucide-react';
import { navigateTo } from '../store/gameSlice';
import { logout } from '../store/authSlice';
import { getAvatars } from '../utils/boardHelper';
import soundManager from '../utils/soundManager';

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentPage } = useSelector((state) => state.game);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const avatars = getAvatars();
  const userAvatar = avatars.find(a => a.id === user?.avatar) || avatars[0];

  const handleNav = (page) => {
    soundManager.playClick();
    dispatch(navigateTo(page));
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    soundManager.playClick();
    dispatch(logout());
    dispatch(navigateTo('landing'));
    setMobileMenuOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Home', icon: Home, page: 'landing' },
        { name: 'Play Arena', icon: Gamepad2, page: 'play' },
        { name: 'Tournaments', icon: Crown, page: 'tournaments' },
        { name: 'Leaderboard', icon: Trophy, page: 'leaderboard' },
        { name: 'Achievements', icon: Award, page: 'achievements' },
        { name: 'Profile', icon: User, page: 'dashboard' },
        { name: 'History', icon: History, page: 'history' },
        { name: 'Settings', icon: Settings, page: 'settings' }
      ]
    : [
        { name: 'Home', icon: Home, page: 'landing' }
      ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-neonBlue group-hover:scale-105 transition-transform duration-300">
              S
            </div>
            <span className="text-xl font-extrabold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Arena
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = currentPage === link.page;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNav(link.page)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    active 
                      ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 shadow-neonBlue' 
                      : 'text-gray-300 hover:text-cyan-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon size={15} />
                  {link.name}
                </button>
              );
            })}

            {/* Admin Dashboard link */}
            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-purple-500/20 transition-all duration-300 ${
                  currentPage === 'admin'
                    ? 'text-purple-400 bg-purple-950/30 shadow-neonPurple'
                    : 'text-gray-300 hover:text-purple-300 hover:bg-slate-800/50'
                }`}
              >
                <Settings size={15} />
                Admin Panel
              </button>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
                <div 
                  onClick={() => handleNav('dashboard')}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs uppercase ${userAvatar.color} group-hover:border-cyan-400 transition-colors`}>
                    {user?.username.slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-cyan-400 transition-colors">
                      {user?.username}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Level {user?.level}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-neonBlue hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <div 
                onClick={() => handleNav('dashboard')}
                className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs uppercase ${userAvatar.color}`}
              >
                {user?.username.slice(0, 2)}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-slate-800/80 transition-all"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-cyan-500/10 px-4 py-4 space-y-3 shadow-lg absolute w-full top-16 left-0 animate-slide-in">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = currentPage === link.page;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNav(link.page)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all duration-300 ${
                    active 
                      ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/20' 
                      : 'text-gray-300 hover:text-cyan-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </button>
              );
            })}

            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all duration-300 ${
                  currentPage === 'admin'
                    ? 'text-purple-400 bg-purple-950/30 border border-purple-500/20'
                    : 'text-gray-300 hover:text-purple-300 hover:bg-slate-800/50'
                }`}
              >
                <Settings size={18} />
                Admin Panel
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left font-semibold text-sm text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 rounded-xl font-bold text-gray-300 hover:bg-slate-800 text-center transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-center shadow-neonBlue transition-transform duration-200"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
