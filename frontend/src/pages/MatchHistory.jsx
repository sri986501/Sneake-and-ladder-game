import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, User, Clock, CheckCircle, HelpCircle, Swords } from 'lucide-react';
import soundManager from '../utils/soundManager';

const MatchHistory = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_URL}/matches/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMatches();
    }
  }, [token]);

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left space-y-2">
        <h2 className="text-4xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
          Combat History
        </h2>
        <p className="text-sm text-gray-400">
          Review your logs of active service inside the Arena.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="py-20 text-gray-500 font-bold glass-panel rounded-2xl border-slate-800">
          No matches logged. Play a game to record logs!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => {
            const dateStr = new Date(match.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            // Check if current user is the winner
            const isWinner = match.winner.userId?.toString() === user._id.toString();

            return (
              <div 
                key={match._id} 
                className={`glass-panel p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isWinner 
                    ? 'border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Swords size={16} className={isWinner ? "text-emerald-400" : "text-cyan-400"} />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      {match.matchMode} Match
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Calendar size={10} />
                    {dateStr}
                  </span>
                </div>

                {/* Players & Outcome */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase font-mono">Winner:</span>
                    <span className={`text-sm font-extrabold flex items-center gap-1 ${
                      isWinner ? 'text-emerald-400' : 'text-cyan-400'
                    }`}>
                      <CheckCircle size={14} />
                      {match.winner.username}
                    </span>
                  </div>

                  {/* Player standings inside match */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-gray-500 uppercase font-mono block">Standings:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {match.players.map((p) => {
                        const isMe = p.userId?.toString() === user._id.toString();
                        return (
                          <div 
                            key={p.username} 
                            className={`p-2 rounded-lg text-xs flex items-center justify-between bg-slate-950/50 border ${
                              isMe ? 'border-cyan-500/20 bg-cyan-950/10' : 'border-slate-800'
                            }`}
                          >
                            <span className={`font-bold truncate max-w-[100px] ${
                              isMe ? 'text-cyan-400' : 'text-gray-300'
                            }`}>
                              {p.username}
                            </span>
                            <span className="font-mono text-gray-400 text-[10px]">
                              Rank {p.rank}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Match Stats footer */}
                <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-slate-800/40 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(match.duration)}
                  </span>
                  <span>
                    Moves: {match.moves}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
