import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Trophy, Zap, Calendar, Award } from 'lucide-react';
import { getAvatars } from '../utils/boardHelper';
import soundManager from '../utils/soundManager';

const Leaderboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('alltime'); // 'daily', 'weekly', 'monthly', 'alltime'
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';
  const avatarsList = getAvatars();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leaderboard?category=${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRankings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [category, token]);

  const handleTabChange = (tab) => {
    soundManager.playClick();
    setCategory(tab);
  };

  const tabs = [
    { id: 'daily', label: 'Daily Wins', icon: Zap },
    { id: 'weekly', label: 'Weekly Points', icon: Calendar },
    { id: 'monthly', label: 'Monthly Points', icon: Calendar },
    { id: 'alltime', label: 'All-Time Score', icon: Trophy }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left space-y-2">
        <h2 className="text-4xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
          Leaderboard Arena
        </h2>
        <p className="text-sm text-gray-400">
          Compete against players globally. Rank standings reset dynamically.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                active
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 shadow-neonBlue'
                  : 'text-gray-400 hover:text-gray-200 bg-slate-900/40 border border-transparent'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ranks Podium for Top 3 */}
      {!loading && rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end max-w-4xl mx-auto">
          {/* Rank 2 (Left) */}
          {rankings[1] && (
            <div className="glass-panel p-5 rounded-2xl border-slate-700/40 text-center relative order-2 md:order-1 h-fit md:pb-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-400 text-slate-950 flex items-center justify-center font-black text-sm border-2 border-slate-800">
                2
              </div>
              <div className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center text-xl uppercase font-bold bg-slate-900 border-slate-400/50 text-slate-400`}>
                {rankings[1].username.slice(0, 2)}
              </div>
              <h4 className="font-extrabold text-gray-200 mt-3">{rankings[1].username}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Level {rankings[1].level}</p>
              <div className="text-xl font-black text-cyan-400 mt-2">{rankings[1].points} pts</div>
            </div>
          )}

          {/* Rank 1 (Center) */}
          {rankings[0] && (
            <div className="glass-panel p-6 rounded-2xl border-amber-500/30 text-center relative order-1 md:order-2 shadow-neonGold border-t-4 md:py-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg border-2 border-slate-800 animate-bounce">
                👑
              </div>
              <div className={`w-18 h-18 mx-auto rounded-full border-2 flex items-center justify-center text-2xl uppercase font-bold bg-slate-900 border-amber-400 text-amber-400 shadow-neonGold`}>
                {rankings[0].username.slice(0, 2)}
              </div>
              <h4 className="font-black text-white text-lg mt-3">{rankings[0].username}</h4>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Lords Champion • Level {rankings[0].level}</p>
              <div className="text-2xl font-black text-amber-400 mt-2">{rankings[0].points} pts</div>
            </div>
          )}

          {/* Rank 3 (Right) */}
          {rankings[2] && (
            <div className="glass-panel p-5 rounded-2xl border-slate-700/40 text-center relative order-3 h-fit md:pb-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-700 text-amber-50 flex items-center justify-center font-black text-sm border-2 border-slate-800">
                3
              </div>
              <div className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center text-xl uppercase font-bold bg-slate-900 border-amber-700/50 text-amber-700`}>
                {rankings[2].username.slice(0, 2)}
              </div>
              <h4 className="font-extrabold text-gray-200 mt-3">{rankings[2].username}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Level {rankings[2].level}</p>
              <div className="text-xl font-black text-cyan-400 mt-2">{rankings[2].points} pts</div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="glass-panel rounded-2xl overflow-hidden border-cyan-500/10">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-20 text-gray-500 font-bold">No ranking entries found. Play a game to record scores!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider text-cyan-500">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Player</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6 text-center">Matches</th>
                  <th className="py-4 px-6 text-center">Win Rate</th>
                  <th className="py-4 px-6 text-center">Trophies</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((p) => {
                  const isAvatar = avatarsList.find(a => a.id === p.avatar) || avatarsList[0];
                  const medalGlow = 
                    p.rank === 1 ? 'bg-amber-950/20 text-amber-400 font-black' :
                    p.rank === 2 ? 'bg-slate-900/20 text-slate-300' :
                    p.rank === 3 ? 'bg-amber-900/10 text-amber-700' : '';

                  return (
                    <tr 
                      key={p.userId || p.username} 
                      className={`border-b border-slate-800/40 hover:bg-slate-900/20 transition-colors text-sm font-medium ${medalGlow}`}
                    >
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold ${
                          p.rank === 1 ? 'bg-amber-500 text-slate-950 text-xs' :
                          p.rank === 2 ? 'bg-slate-400 text-slate-950 text-xs' :
                          p.rank === 3 ? 'bg-amber-700 text-amber-50 text-xs' : 'text-gray-400'
                        }`}>
                          {p.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center font-bold ${isAvatar.color}`}>
                          {p.username.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-200">{p.username}</span>
                          <span className="text-[10px] text-gray-400">Lv {p.level}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-cyan-400">{p.points}</td>
                      <td className="py-4 px-6 text-center text-gray-300">{p.gamesPlayed}</td>
                      <td className="py-4 px-6 text-center text-gray-300">{p.winRate}%</td>
                      <td className="py-4 px-6 text-center text-lg text-amber-400">
                        {'🏆'.repeat(Math.min(5, p.trophies || 0)) || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
