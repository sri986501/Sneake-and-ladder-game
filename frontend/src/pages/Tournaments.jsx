import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { navigateTo } from '../store/gameSlice';
import soundManager from '../utils/soundManager';
import { Trophy, ShieldAlert, Award, Play, Users, Coins, Plus, Calendar, Clock } from 'lucide-react';

const TournamentsPage = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState(50);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Contribute states
  const [contribAmount, setContribAmount] = useState(50);
  const [selectedTourneyId, setSelectedTourneyId] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/tournaments`, { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setTournaments(data.data);
      } else {
        setError(data.message || 'Failed to load tournaments');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error loading tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    soundManager.playClick();

    if (!title.trim()) {
      setError('Tournament title is required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tournaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          entryFee: parseInt(entryFee) || 0,
          maxPlayers: parseInt(maxPlayers) || 8
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Tournament conducted successfully!');
        setTitle('');
        setDescription('');
        setEntryFee(50);
        setMaxPlayers(8);
        setShowCreateForm(false);
        fetchTournaments();
      } else {
        setError(data.message || 'Failed to create tournament');
      }
    } catch (err) {
      setError('Connection error creating tournament');
    }
  };

  const handleJoin = async (id) => {
    setError('');
    setSuccess('');
    soundManager.playClick();

    try {
      const res = await fetch(`${API_URL}/tournaments/${id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Successfully registered for tournament!');
        // Trigger profile reload to show updated points if entry fee was deducted
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (meRes.ok && meData.success) {
          dispatch({ type: 'auth/authSuccess', payload: { token, user: meData.data } });
        }
        fetchTournaments();
      } else {
        setError(data.message || 'Failed to join tournament');
      }
    } catch (err) {
      setError('Connection error joining tournament');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    soundManager.playClick();

    if (!contribAmount || contribAmount <= 0) {
      setError('Contribution amount must be positive');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tournaments/${selectedTourneyId}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseInt(contribAmount) })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Contributed ${contribAmount} points to the prize pool! ⚜️`);
        setSelectedTourneyId(null);
        // Refresh profile points
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (meRes.ok && meData.success) {
          dispatch({ type: 'auth/authSuccess', payload: { token, user: meData.data } });
        }
        fetchTournaments();
      } else {
        setError(data.message || 'Failed to contribute');
      }
    } catch (err) {
      setError('Connection error contributing points');
    }
  };

  const handleStart = async (id) => {
    setError('');
    setSuccess('');
    soundManager.playClick();

    try {
      const res = await fetch(`${API_URL}/tournaments/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Tournament officially commenced! Matches are active.');
        fetchTournaments();
      } else {
        setError(data.message || 'Failed to start tournament');
      }
    } catch (err) {
      setError('Connection error starting tournament');
    }
  };

  const handleComplete = async (id) => {
    setError('');
    setSuccess('');
    soundManager.playClick();

    try {
      const res = await fetch(`${API_URL}/tournaments/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Tournament completed! Champ credited with ${data.data.prizePool} points!`);
        // Refresh profile points in case we won
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (meRes.ok && meData.success) {
          dispatch({ type: 'auth/authSuccess', payload: { token, user: meData.data } });
        }
        fetchTournaments();
      } else {
        setError(data.message || 'Failed to complete tournament');
      }
    } catch (err) {
      setError('Connection error concluding tournament');
    }
  };

  const handlePlayTournamentMatch = (tournamentId) => {
    soundManager.playClick();
    // Dispatch selected tournament details to Redux
    dispatch({ type: 'game/setRoomCode', payload: `T_${tournamentId.slice(-4).toUpperCase()}` });
    dispatch(navigateTo('play'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-serif">
      
      {/* Banner */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl sm:text-5xl font-black uppercase text-neonBlue tracking-wider drop-shadow-md">
          Grand Tournaments Arena
        </h2>
        <p className="text-sm font-sans text-stone-400 italic max-w-xl mx-auto">
          Conducted by grand scholars and aristocrats. Register with entry fees, contribute to the prize pool, and play matches to earn glorious points.
        </p>
      </div>

      {/* Warnings & Success */}
      {error && (
        <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-red-950/20 border border-[#8C2B2B]/40 text-[#8C2B2B] text-xs font-sans font-bold flex items-center gap-2">
          <ShieldAlert size={14} />
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-emerald-950/20 border border-[#2E5A44]/40 text-emerald-400 text-xs font-sans font-bold flex items-center gap-2">
          <Award size={14} />
          {success}
        </div>
      )}

      {/* Overview & Quick Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-cardBg border border-[#5C4033] p-4 rounded-xl max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 font-sans text-xs">
          <div className="flex items-center gap-1.5 text-[#FAF5EB]">
            <Coins size={14} className="text-[#D4AF37]" />
            <span>Profile Points: <strong className="text-[#D4AF37] font-bold font-serif">{user?.totalPoints || 0} ⚜️</strong></span>
          </div>
          <div className="w-[1px] h-4 bg-stone-850" />
          <div className="flex items-center gap-1.5 text-stone-300">
            <Trophy size={14} className="text-neonBlue" />
            <span>Conducted Tourneys: <strong className="font-serif text-[#C5A059]">{tournaments.length}</strong></span>
          </div>
        </div>

        <button
          onClick={() => { soundManager.playClick(); setShowCreateForm(!showCreateForm); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-neonBlue hover:bg-[#C5A059] text-stone-950 font-bold font-serif rounded-lg shadow-md transition-all text-xs uppercase"
        >
          <Plus size={14} />
          Conduct a Tournament
        </button>
      </div>

      {/* Conduct Form */}
      {showCreateForm && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-2xl border-[#8C6D4C] text-left space-y-5 animate-slide-in relative z-20">
          <h3 className="text-xl font-bold text-neonBlue border-b border-[#5C4033] pb-2 uppercase">
            Conduct New Tournament
          </h3>
          <form onSubmit={handleCreate} className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-gray-300 font-bold uppercase">Title / Callsign</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Autumn Bracket"
                className="w-full bg-stone-950/80 border border-stone-850 px-3 py-2 rounded-lg text-gray-200 outline-none focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-gray-300 font-bold uppercase">Chronicle Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the event..."
                rows="2"
                className="w-full bg-stone-950/80 border border-stone-850 px-3 py-2 rounded-lg text-gray-200 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold uppercase">Entry Fee (Points)</label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className="w-full bg-stone-950/80 border border-stone-850 px-3 py-2 rounded-lg text-gray-200 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold uppercase">Max Players</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  className="w-full bg-stone-950/80 border border-stone-850 px-3 py-2 rounded-lg text-gray-300 outline-none focus:border-[#D4AF37]"
                >
                  <option value="4">4 Players</option>
                  <option value="8">8 Players</option>
                  <option value="16">16 Players</option>
                  <option value="32">32 Players</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-[#5C4033]">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-950 font-serif font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-neonBlue hover:bg-[#C5A059] text-stone-950 font-serif font-black uppercase"
              >
                Conducted Formally
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contribute Modal */}
      {selectedTourneyId && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border-[#8C6D4C] text-left space-y-4 font-sans text-xs">
            <h3 className="text-lg font-bold font-serif text-neonBlue border-b border-[#5C4033] pb-2 uppercase">
              Contribute to Prize Pool
            </h3>
            <p className="text-stone-300">
              Contribute your profile points to increase the total prize pool. The winner takes it all!
            </p>
            <form onSubmit={handleContribute} className="space-y-4">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold uppercase">Contribution Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    className="flex-1 bg-stone-950/80 border border-stone-850 px-3 py-2 rounded-lg text-gray-200 outline-none focus:border-[#D4AF37]"
                  />
                  <div className="flex gap-1">
                    {[50, 100, 250].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setContribAmount(amt)}
                        className="px-2.5 py-2 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-[#5C4033]">
                <button
                  type="button"
                  onClick={() => setSelectedTourneyId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-950 font-serif font-bold uppercase"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-neonBlue hover:bg-[#C5A059] text-stone-950 font-serif font-black uppercase"
                >
                  Donate Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournaments List Grid */}
      {loading ? (
        <div className="py-12 text-center text-stone-400">
          <Clock className="mx-auto animate-spin mb-2" size={24} />
          <span>Synchronizing records from board registries...</span>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="py-16 text-center text-stone-500 max-w-xl mx-auto glass-panel p-8 rounded-xl">
          <Calendar size={36} className="mx-auto mb-2 opacity-50" />
          <h4 className="text-lg font-bold font-serif text-stone-300">No Tournaments Registered</h4>
          <p className="text-xs font-sans mt-1">Conduct a tournament above to begin your chronicles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {tournaments.map((t) => {
            const isParticipant = t.participants.some(p => p.user && p.user.toString() === user?._id);
            const isCreator = t.creator && t.creator.toString() === user?._id;

            return (
              <div
                key={t._id}
                className="glass-panel p-5 rounded-2xl border-[#5C4033] flex flex-col justify-between text-left space-y-4 hover:border-[#8C6D4C] transition-colors relative"
              >
                {/* Title and Status */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-[#FAF5EB] pr-2 tracking-wide font-serif">
                      {t.title}
                    </h3>
                    <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      t.status === 'upcoming' ? 'bg-yellow-950/40 text-neonBlue border border-yellow-800/30' :
                      t.status === 'active' ? 'bg-[#2E5A44]/20 text-emerald-400 border border-emerald-800/20 animate-pulse' :
                      'bg-stone-900/60 text-stone-500 border border-stone-850'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-xs text-stone-400 font-sans italic leading-normal">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Core Parameters */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#5C4033]/40 font-sans text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-stone-500">Prize Pool</span>
                    <strong className="text-[#D4AF37] font-serif font-black">{t.prizePool} ⚜️</strong>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-stone-500">Entry Fee</span>
                    <strong className="text-stone-300 font-serif font-bold">{t.entryFee} ⚜️</strong>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-stone-500">Participants</span>
                    <strong className="text-stone-300 font-serif font-bold">{t.participants.length} / {t.maxPlayers}</strong>
                  </div>
                </div>

                {/* Participant list/leaderboard */}
                {t.participants.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-sans font-bold uppercase tracking-wider text-neonBlue">
                      Leaderboard Standings
                    </h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {[...t.participants].sort((a, b) => b.points - a.points).map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-sans py-0.5 border-b border-[#5C4033]/20">
                          <span className="text-stone-300 flex items-center gap-1">
                            {idx === 0 && <span className="text-[#D4AF37]">👑</span>}
                            {p.username}
                          </span>
                          <span className="text-stone-400 font-mono">
                            {p.points} pts ({p.wins} wins)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  
                  {/* Contribute points */}
                  {t.status !== 'completed' && (
                    <button
                      onClick={() => { soundManager.playClick(); setSelectedTourneyId(t._id); }}
                      className="px-2.5 py-1.5 rounded bg-stone-900 hover:bg-stone-850 border border-stone-800 text-[#D4AF37] font-bold font-serif text-[10px] uppercase flex items-center gap-1 shadow-sm"
                    >
                      <Coins size={10} />
                      Contribute
                    </button>
                  )}

                  {/* Register to join */}
                  {t.status === 'upcoming' && !isParticipant && t.participants.length < t.maxPlayers && (
                    <button
                      onClick={() => handleJoin(t._id)}
                      className="px-3 py-1.5 rounded bg-[#2E5A44] hover:bg-[#3D7A5C] text-stone-100 font-bold font-serif text-[10px] uppercase flex items-center gap-1"
                    >
                      <Users size={10} />
                      Join
                    </button>
                  )}

                  {/* Start tournament (Admin or Creator) */}
                  {t.status === 'upcoming' && isCreator && t.participants.length >= 2 && (
                    <button
                      onClick={() => handleStart(t._id)}
                      className="px-3 py-1.5 rounded bg-neonBlue hover:bg-[#C5A059] text-stone-950 font-bold font-serif text-[10px] uppercase flex items-center gap-1"
                    >
                      <Play size={10} />
                      Commence
                    </button>
                  )}

                  {/* Launch games for active participants */}
                  {t.status === 'active' && isParticipant && (
                    <button
                      onClick={() => handlePlayTournamentMatch(t._id)}
                      className="px-3 py-1.5 rounded bg-gradient-to-r from-yellow-600 to-[#D4AF37] hover:from-yellow-500 text-stone-950 font-black font-serif text-[10px] uppercase flex items-center gap-1 shadow-md animate-bounce"
                    >
                      <Play size={10} fill="black" />
                      Deploy Match
                    </button>
                  )}

                  {/* Conclude active tournament */}
                  {t.status === 'active' && isCreator && (
                    <button
                      onClick={() => handleComplete(t._id)}
                      className="px-3 py-1.5 rounded bg-[#8C2B2B] hover:bg-[#A83D3D] text-stone-100 font-bold font-serif text-[10px] uppercase flex items-center gap-1"
                    >
                      <Award size={10} />
                      Conclude
                    </button>
                  )}

                  {/* Winner Display */}
                  {t.status === 'completed' && t.winner && (
                    <div className="w-full text-center text-xs font-sans text-stone-400 py-1 bg-yellow-950/20 border border-yellow-900/30 rounded flex items-center justify-center gap-1">
                      <span>Winner:</span>
                      <strong className="text-[#D4AF37] font-serif font-black">{t.winner.username} 👑</strong>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
};

export default TournamentsPage;
