import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, Gamepad2, Award, Zap, ShieldAlert, TrendingUp, Sparkles, UserPlus, Trash2, Search, UserCheck
} from 'lucide-react';
import { navigateTo } from '../store/gameSlice';
import { updateUser } from '../store/authSlice';
import { getAvatars } from '../utils/boardHelper';
import soundManager from '../utils/soundManager';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Daily Reward state
  const [claiming, setClaiming] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');
  const [rewardError, setRewardError] = useState('');
  const [countdown, setCountdown] = useState('');

  // Friends states
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const avatars = getAvatars();
  const myAvatar = avatars.find(a => a.id === user?.avatar) || avatars[0];

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFriends(data.data.friends || []);
        dispatch(updateUser(data.data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchMe();
    }
  }, [token]);

  // Countdown timer for daily reward
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (!user.lastDailyRewardClaimed) {
        setCountdown('');
        return;
      }
      const lastClaim = new Date(user.lastDailyRewardClaimed);
      const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
      const diff = nextClaim - new Date();

      if (diff <= 0) {
        setCountdown('');
      } else {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleClaimReward = async () => {
    soundManager.playClick();
    setClaiming(true);
    setRewardMsg('');
    setRewardError('');

    try {
      const res = await fetch(`${API_URL}/users/daily-reward`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRewardMsg(data.message);
        soundManager.playVictory();
        
        // Fire confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Trigger updates
        fetchStats();
        fetchMe();
      } else {
        setRewardError(data.message);
      }
    } catch (err) {
      setRewardError('Claiming failed. Try again.');
    } finally {
      setClaiming(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch(`${API_URL}/users/search?query=${searchQuery.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendId) => {
    soundManager.playClick();
    setFriendActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/friends/${friendId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMe();
        // Clear search results/query
        setSearchQuery('');
        setSearchResults([]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    soundManager.playClick();
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      const res = await fetch(`${API_URL}/users/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMe();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingStats || !user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xpNeeded = stats?.xpNeeded || user.level * 300;
  const xpPercent = Math.min(100, Math.max(0, (stats?.xp / xpNeeded) * 100)) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner - Profile Welcome */}
      <div className="w-full rounded-2xl glass-panel p-6 border-cyan-500/20 shadow-neonBlue flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl uppercase ${myAvatar.color} shadow-neonBlue`}>
            {user.username.slice(0, 2)}
          </div>
          <div className="text-left space-y-1">
            <h2 className="text-3xl font-extrabold uppercase bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
              {user.username}
            </h2>
            <p className="text-xs font-mono text-cyan-400">ID: {user._id}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                Role: {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="w-full md:w-80 flex flex-col gap-2">
          <div className="flex justify-between items-end text-xs font-bold text-gray-300">
            <span>Level {user.level}</span>
            <span className="text-gray-400">{stats?.xp} / {xpNeeded} XP</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-[0_0_8px_#06B6D4]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 columns for main Stats and Daily Rewards */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="glass-panel p-4 rounded-xl text-center space-y-1">
              <Gamepad2 className="mx-auto text-cyan-400" size={24} />
              <div className="text-2xl font-black">{stats?.gamesPlayed}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Games Played</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-center space-y-1">
              <Trophy className="mx-auto text-amber-400" size={24} />
              <div className="text-2xl font-black text-amber-400">{stats?.wins}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Victories</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-center space-y-1">
              <Sparkles className="mx-auto text-indigo-400" size={24} />
              <div className="text-2xl font-black text-indigo-400">{stats?.winRate}%</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Win Rate</div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-center space-y-1">
              <Zap className="mx-auto text-purple-400" size={24} />
              <div className="text-2xl font-black text-purple-400">{stats?.totalPoints}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Arena Score</div>
            </div>

          </div>

          {/* Detailed Gameplay accomplishments cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Ladders climbed */}
            <div className="glass-panel p-5 rounded-xl border-amber-500/10 flex items-center justify-between">
              <div className="space-y-1 text-left">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Ladders Climbed</span>
                <span className="text-3xl font-black text-amber-500">{stats?.ladderClimbs}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <TrendingUp size={24} />
              </div>
            </div>

            {/* Snakes evaded */}
            <div className="glass-panel p-5 rounded-xl border-rose-500/10 flex items-center justify-between">
              <div className="space-y-1 text-left">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Snakes Bitten</span>
                <span className="text-3xl font-black text-rose-500">{stats?.snakeEscapes}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-950/30 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <ShieldAlert size={24} />
              </div>
            </div>

            {/* Streaks records */}
            <div className="glass-panel p-5 rounded-xl border-purple-500/10 flex items-center justify-between">
              <div className="space-y-1 text-left">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Streaks (Current/Best)</span>
                <span className="text-3xl font-black text-purple-400">
                  {stats?.currentStreak} / <span className="text-xl text-gray-400 font-bold">{stats?.bestStreak}</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Award size={24} />
              </div>
            </div>

          </div>

          {/* Daily Reward Module */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 text-left space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold uppercase tracking-wide text-cyan-400 flex items-center gap-2">
                  <Sparkles size={20} className="animate-spin" />
                  Daily Operations Rewards
                </h3>
                <p className="text-sm text-gray-400">
                  Claim once every 24 hours to score +50 Arena Points and +150 experience XP.
                </p>
              </div>

              <div>
                {countdown ? (
                  <button
                    disabled
                    className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-gray-400 font-bold text-sm select-none"
                  >
                    Resets in: {countdown}
                  </button>
                ) : (
                  <button
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold shadow-neonBlue hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
                  >
                    {claiming ? 'Processing...' : 'Claim Daily +50'}
                  </button>
                )}
              </div>
            </div>

            {rewardMsg && (
              <p className="text-xs text-emerald-400 font-bold bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-950">
                {rewardMsg}
              </p>
            )}
            {rewardError && (
              <p className="text-xs text-rose-400 font-bold bg-rose-950/30 p-2.5 rounded-lg border border-rose-950">
                {rewardError}
              </p>
            )}
          </div>

        </div>

        {/* Right 1 column for Friends Management */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border-indigo-500/10 space-y-4">
            <h3 className="text-lg font-extrabold uppercase tracking-wide text-indigo-400 text-left border-b border-slate-800 pb-2">
              Friend Connections
            </h3>

            {/* Friend search form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Find players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/30 pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all"
                />
                <Search size={12} className="absolute left-2.5 top-2.5 text-gray-500" />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0"
              >
                Find
              </button>
            </form>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800 max-h-40 overflow-y-auto space-y-2">
                <div className="text-[10px] text-gray-400 font-bold border-b border-slate-800 pb-1 text-left">Search Results</div>
                {searchResults.map((p) => {
                  const alreadyFriend = friends.some(f => f._id === p._id);
                  const isAvatar = avatars.find(a => a.id === p.avatar) || avatars[0];
                  return (
                    <div key={p._id} className="flex items-center justify-between text-left">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full border text-[8px] flex items-center justify-center font-bold ${isAvatar.color}`}>
                          {p.username.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-200">{p.username}</span>
                          <span className="text-[9px] text-gray-400">Lv {p.level}</span>
                        </div>
                      </div>
                      
                      {alreadyFriend ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                          <UserCheck size={10} /> Friend
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(p._id)}
                          disabled={friendActionLoading}
                          className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                          title="Add Friend"
                        >
                          <UserPlus size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Friends list */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {friends.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">No connections added yet. Find other players to populate your list!</p>
              ) : (
                friends.map((f) => {
                  const isAvatar = avatars.find(a => a.id === f.avatar) || avatars[0];
                  return (
                    <div key={f._id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-left">
                        <div className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center font-bold ${isAvatar.color}`}>
                          {f.username.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-200">{f.username}</span>
                          <span className="text-[10px] text-gray-400">Level {f.level} • {f.totalPoints} pts</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFriend(f._id)}
                        className="p-1.5 rounded hover:bg-rose-950/20 text-gray-500 hover:text-rose-400 transition-colors"
                        title="Remove Friend"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
