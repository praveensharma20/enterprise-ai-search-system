import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  useEffect(() => {
    setMode(initialMode);
    setError(''); // Clear errors when mode changes
  }, [initialMode, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // 1. Signup Request
        await axios.post(`${API_BASE_URL}/signup`, {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password
        });
        
        // After signup, automatically switch to login or just login directly
        setMode('login');
        setError('Account created! Please authorize to continue.');
      } else {
        // 2. Login Request
        const response = await axios.post(`${API_BASE_URL}/login`, {
          email: formData.email,
          password: formData.password
        });

        // Store Token (localStorage is common for simple apps)
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // 3. Success Redirect
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'System authentication failure.';
      setError(typeof msg === 'string' ? msg : 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[60px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">
                {mode === 'login' ? 'Access System' : 'Create Account'}
              </h2>
              <p className="text-slate-500 text-sm mb-8 font-medium">
                {mode === 'login' ? 'Authorize your session.' : 'Join the intelligence frontier.'}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] uppercase tracking-wider font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {mode === 'signup' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Full Name</label>
                      <input 
                        required name="full_name" type="text" placeholder="John Doe" 
                        value={formData.full_name} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Email Address</label>
                  <input 
                    required name="email" type="email" placeholder="name@enterprise.com" 
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 pb-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Password</label>
                  <input 
                    required name="password" type="password" placeholder="••••••••" 
                    value={formData.password} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-indigo-50 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (mode === 'login' ? 'Initialize Login' : 'Deploy Account')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={toggleMode} className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors">
                  {mode === 'login' ? "New operative? Create Account" : "Registered? Access System"}
                </button>
              </div>
            </div>

            <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;