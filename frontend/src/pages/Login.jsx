import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import { navigateTo } from '../store/gameSlice';
import soundManager from '../utils/soundManager';

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundManager.playClick();
    setValidationError('');
    dispatch(clearError());

    // Basic email validation
    if (!email || !password) {
      return setValidationError('All fields are required.');
    }

    dispatch(authStart());

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      // Play success chime
      soundManager.playClick();
      dispatch(authSuccess({ token: data.token, user: data.user }));
      dispatch(navigateTo('dashboard'));
    } catch (err) {
      dispatch(authFailure(err.message));
    }
  };

  const handleRegisterRedirect = () => {
    soundManager.playClick();
    dispatch(clearError());
    dispatch(navigateTo('register'));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 rounded-2xl glass-panel border-cyan-500/20 shadow-neonBlue space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-400">
            Login to enter the Arena and start climbing
          </p>
        </div>

        {/* Error Banners */}
        {(error || validationError) && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wide pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-cyan-500/60" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@arena.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-500/40 text-gray-200 placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wide pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-cyan-500/60" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-500/40 text-gray-200 placeholder-gray-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 pl-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 accent-cyan-500 cursor-pointer"
              />
              Remember Me
            </label>
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 hover:underline"
              onClick={() => alert("Credentials: Use pre-seeded email 'climber@arena.com' and password 'password123', or Register a new account!")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold shadow-neonBlue disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 uppercase tracking-wider text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Connect Session
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400 font-medium">
            New to the Arena?{' '}
            <button
              onClick={handleRegisterRedirect}
              className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
