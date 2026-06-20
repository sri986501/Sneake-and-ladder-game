import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authSuccess, logout } from './store/authSlice';
import { navigateTo } from './store/gameSlice';

import Navbar from './components/Navbar';
import BackgroundParticles from './components/BackgroundParticles';
import SoundController from './components/SoundController';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlayPage from './pages/Play';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import MatchHistory from './pages/MatchHistory';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import TournamentsPage from './pages/Tournaments';

import soundManager from './utils/soundManager';

const App = () => {
  const dispatch = useDispatch();
  const { currentPage } = useSelector((state) => state.game);
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  const API_URL = 'http://localhost:5000/api';

  // Attempt auto-login if token exists
  useEffect(() => {
    const autoLogin = async () => {
      const storedToken = localStorage.getItem('arena_token');
      if (!storedToken) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          dispatch(authSuccess({ token: storedToken, user: data.data }));
        } else {
          // Token expired or invalid
          dispatch(logout());
        }
      } catch (err) {
        console.warn('Auto-login connection error', err);
      }
    };
    
    autoLogin();
  }, [dispatch]);

  // Handle document click to enable Web Audio Context
  useEffect(() => {
    const triggerAudioCtx = () => {
      soundManager.init();
      document.removeEventListener('click', triggerAudioCtx);
    };
    document.addEventListener('click', triggerAudioCtx);
    return () => document.removeEventListener('click', triggerAudioCtx);
  }, []);

  // Page Routing Map
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'dashboard':
        return (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        );
      case 'play':
        return <PlayPage />;
      case 'tournaments':
        return (
          <ProtectedRoute>
            <TournamentsPage />
          </ProtectedRoute>
        );
      case 'leaderboard':
        return (
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        );
      case 'achievements':
        return (
          <ProtectedRoute>
            <Achievements />
          </ProtectedRoute>
        );
      case 'history':
        return (
          <ProtectedRoute>
            <MatchHistory />
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Floating sound config widget */}
      <SoundController />

      {/* Background visual graphics */}
      <BackgroundParticles />

      {/* Active Page View Container */}
      <main className="flex-grow relative z-10">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
