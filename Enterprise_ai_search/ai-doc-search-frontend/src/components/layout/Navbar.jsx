import React, { useState, useEffect } from 'react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../auth/AuthModal';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  
  // UI States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check Local Storage for Auth Status
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Listen for storage changes (helpful if login happens in another tab/component)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [isAuthOpen]); // Re-check when modal closes

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Nexus', path: '/' },
    { name: 'Vault', path: '/vault' },
    { name: 'Engine', path: '/search' },
    { name: 'Dash', path: '/dashboard' },
    { name: 'Config', path: '/settings' }
  ];

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <nav className="fixed top-6 left-0 w-full z-[100] px-6 pointer-events-none">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between pointer-events-auto">
          
          {/* LOGO */}
          <Link to="/" className="group flex items-center gap-3 no-underline flex-1">
            <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-2xl group-hover:border-indigo-500/50 transition-colors">
              <span className="text-white font-black text-xs tracking-widest">S_I</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-[0.2em] text-white leading-none uppercase">Semantic</span>
              <span className="text-[7px] uppercase tracking-[0.5em] font-black text-indigo-500 mt-1">Intelligence Core</span>
            </div>
          </Link>

          {/* CENTRAL COMMAND BAR: Only visible when logged in */}
          <AnimatePresence>
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              >
                <div className={`flex items-center gap-2 px-3 transition-all duration-500 ease-in-out ${isSearchFocused ? 'w-64' : 'w-32'}`}>
                  <svg className={`w-3.5 h-3.5 transition-colors ${isSearchFocused ? 'text-indigo-500' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    type="text" 
                    placeholder="Find..." 
                    className="bg-transparent border-none outline-none text-[10px] text-white placeholder-slate-600 w-full font-bold uppercase tracking-widest"
                  />
                </div>

                <div className="w-[1px] h-4 bg-white/10 mx-2" />

                <div className="flex gap-0.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        location.pathname === item.path ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="navbar-pill"
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AUTH ACTIONS / PROFILE */}
          <div className="flex items-center justify-end gap-8 flex-1">
            {!user ? (
              <>
                <button 
                  onClick={() => openAuth('login')} 
                  className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white cursor-pointer transition-colors"
                >
                  Access_Log
                </button>
                <button 
                  onClick={() => openAuth('signup')} 
                  className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-indigo-50 hover:scale-[1.02] transition-all shadow-xl shadow-white/5"
                >
                  Deploy
                </button>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 group px-2 py-1 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.full_name}</span>
                    <span className="text-[7px] text-indigo-500 font-bold uppercase tracking-widest">Active Operative</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 text-xs font-bold">
                    {user.full_name?.charAt(0)}
                  </div>
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-48 bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl z-[110]"
                    >
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Terminate_Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
};

export default Navbar;