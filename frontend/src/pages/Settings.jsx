import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Save, Volume2, VolumeX, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { updateUser } from '../store/authSlice';
import { getAvatars } from '../utils/boardHelper';
import soundManager from '../utils/soundManager';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar1');
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [volume, setVolume] = useState(soundManager.volume);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const API_URL = 'http://localhost:5000/api';
  const avatars = getAvatars();

  const handleMuteToggle = () => {
    soundManager.init();
    const nextMute = !isMuted;
    soundManager.setMute(nextMute);
    setIsMuted(nextMute);
    soundManager.playClick();
  };

  const handleVolumeChange = (e) => {
    const nextVol = parseFloat(e.target.value);
    soundManager.setVolume(nextVol);
    setVolume(nextVol);
    if (isMuted && nextVol > 0) {
      soundManager.setMute(false);
      setIsMuted(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    soundManager.playClick();
    setSaving(true);
    setMsg('');
    setErr('');

    if (!username.trim()) {
      setSaving(false);
      return setErr('Username cannot be empty.');
    }

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username.trim(),
          avatar: selectedAvatar
        })
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(updateUser(data.data));
        setMsg('Profile configurations saved successfully!');
        soundManager.playVictory();
      } else {
        setErr(data.message || 'Failed to save settings.');
      }
    } catch (e) {
      setErr('An error occurred during save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-left space-y-2">
        <h2 className="text-4xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
          Arena Operations Settings
        </h2>
        <p className="text-sm text-gray-400">
          Modify your avatar appearance, callsign name, and sound levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile forms - Left 2 columns */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleProfileSave} className="glass-panel p-6 rounded-2xl border-cyan-500/20 text-left space-y-6">
            <h3 className="text-lg font-extrabold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              Identity Profile
            </h3>

            {/* Error banners */}
            {err && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold">
                {err}
              </div>
            )}
            {msg && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                {msg}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Player Callsign</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Callsign"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-500/40 text-gray-200 outline-none transition-all font-semibold"
              />
            </div>

            {/* Avatar Select grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wide block">Select Avatar</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {avatars.map((av) => {
                  const active = selectedAvatar === av.id;
                  return (
                    <div
                      key={av.id}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedAvatar(av.id);
                      }}
                      className={`relative cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                        active
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-neonBlue scale-105'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs uppercase ${av.color}`}>
                        {av.label.slice(0, 2)}
                      </div>
                      <span className="text-[10px] text-gray-300 font-bold truncate max-w-full">{av.label}</span>
                      
                      {active && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-bold border border-slate-900 shadow-neonBlue">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold shadow-neonBlue hover:scale-105 active:scale-95 transition-all uppercase tracking-wider text-xs ml-auto"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Commit Profile'}
            </button>
          </form>
        </div>

        {/* Audio control - Right 1 column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-indigo-500/10 text-left space-y-6">
            <h3 className="text-lg font-extrabold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              Audio Systems
            </h3>

            {/* Mute toggle button */}
            <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <span className="text-sm font-semibold text-gray-200">System Mute</span>
              <button
                onClick={handleMuteToggle}
                className={`p-2 rounded-xl border transition-all ${
                  isMuted 
                    ? 'border-rose-500/30 text-rose-400 bg-rose-950/20 shadow-sm'
                    : 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20'
                }`}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Volume range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                <span>Output Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-800 accent-cyan-400"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
