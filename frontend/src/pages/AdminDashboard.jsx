import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Shield, Users, RefreshCw, Trash2, Calendar, Clipboard, AlertTriangle } from 'lucide-react';
import soundManager from '../utils/soundManager';

const AdminDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'leaderboard' | 'logs'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } else if (activeTab === 'logs') {
        const res = await fetch(`${API_URL}/admin/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMatches(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchData();
    }
  }, [activeTab, token]);

  const handleDeleteUser = async (userId) => {
    soundManager.playClick();
    if (!confirm('Are you sure you want to delete this player account permanently? This action cannot be undone.')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetLeaderboard = async (type) => {
    soundManager.playClick();
    if (!confirm(`Are you absolutely sure you want to reset the '${type}' leaderboard? This changes values across all database profiles.`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/reset-leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Secure role verification rendering
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="glass-panel p-6 max-w-md rounded-2xl border-rose-500/20 text-center space-y-4">
          <AlertTriangle size={48} className="mx-auto text-rose-500 animate-bounce" />
          <h3 className="text-xl font-extrabold uppercase text-rose-500 tracking-wider">Access Restrained</h3>
          <p className="text-sm text-gray-400">
            This module requires administrator authorization. Credentials logged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="text-left space-y-2">
        <h2 className="text-4xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent neon-text-purple">
          Control Center Dashboard
        </h2>
        <p className="text-sm text-gray-400 flex items-center gap-1.5">
          <Shield size={14} className="text-purple-400" />
          Authenticated: Administrator Mode
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => { soundManager.playClick(); setActiveTab('users'); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'users'
              ? 'text-purple-400 bg-purple-950/40 border border-purple-500/20 shadow-neonPurple'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users size={14} />
          User Registry
        </button>

        <button
          onClick={() => { soundManager.playClick(); setActiveTab('leaderboard'); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'leaderboard'
              ? 'text-purple-400 bg-purple-950/40 border border-purple-500/20 shadow-neonPurple'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <RefreshCw size={14} />
          Database Operations
        </button>

        <button
          onClick={() => { soundManager.playClick(); setActiveTab('logs'); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'logs'
              ? 'text-purple-400 bg-purple-950/40 border border-purple-500/20 shadow-neonPurple'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clipboard size={14} />
          Match Logs
        </button>
      </div>

      {/* Main Grid display area */}
      <div className="glass-panel rounded-2xl overflow-hidden border-purple-500/10">
        
        {/* Loading overlay */}
        {loading && activeTab !== 'leaderboard' ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-purple-400">
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Rank Level</th>
                  <th className="py-4 px-6">Points</th>
                  <th className="py-4 px-6">Record (W/L)</th>
                  <th className="py-4 px-6">Created At</th>
                  <th className="py-4 px-6 text-center">Decommission</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-800/40 hover:bg-slate-900/10">
                    <td className="py-4 px-6 font-bold text-gray-200">{u.username}</td>
                    <td className="py-4 px-6 text-gray-400 font-mono text-xs">{u.email}</td>
                    <td className="py-4 px-6">Level {u.level}</td>
                    <td className="py-4 px-6 text-purple-400 font-bold">{u.totalPoints}</td>
                    <td className="py-4 px-6 text-gray-400">
                      {u.wins} wins / {u.losses} losses
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={actionLoading || u._id === user._id}
                        className="p-1.5 rounded hover:bg-rose-950/20 text-rose-500 disabled:opacity-30 transition-all"
                        title="Ban Player Account"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'leaderboard' ? (
          <div className="p-8 space-y-6 text-left max-w-2xl">
            <h3 className="text-lg font-extrabold uppercase text-purple-400">
              Clear & Reset Operations
            </h3>
            <p className="text-xs text-gray-400">
              Trigger database update loops to scrub scores. All user games played and streak attributes are deleted if 'All-Time' is chosen. Warning: operations cannot be reversed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleResetLeaderboard('weekly')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-purple-400 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5"
              >
                Reset Weekly Index
              </button>
              <button
                onClick={() => handleResetLeaderboard('monthly')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-purple-400 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5"
              >
                Reset Monthly Index
              </button>
              <button
                onClick={() => handleResetLeaderboard('alltime')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 text-rose-400 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5"
              >
                Scrub All Scores
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-purple-400">
                  <th className="py-4 px-6">Match Mode</th>
                  <th className="py-4 px-6">Winner Name</th>
                  <th className="py-4 px-6">Total Players</th>
                  <th className="py-4 px-6">Moves</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Logged At</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m._id} className="border-b border-slate-800/40 hover:bg-slate-900/10">
                    <td className="py-4 px-6 font-bold text-gray-200 capitalize">{m.matchMode}</td>
                    <td className="py-4 px-6 text-purple-400 font-bold">{m.winner.username}</td>
                    <td className="py-4 px-6 text-gray-400">{m.players.length}</td>
                    <td className="py-4 px-6 font-mono text-xs">{m.moves}</td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {Math.floor(m.duration / 60)}m {m.duration % 60}s
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono text-xs">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
