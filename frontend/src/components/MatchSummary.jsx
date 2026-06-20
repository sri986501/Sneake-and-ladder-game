import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw, Award, CheckCircle } from 'lucide-react';
import { getAvatars } from '../utils/boardHelper';
import soundManager from '../utils/soundManager';

const MatchSummary = ({ winner, rankings, rewards, onPlayAgain, onExit }) => {
  const avatars = getAvatars();

  useEffect(() => {
    soundManager.playVictory();
    // Fire confetti continuously for 3 seconds
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [winner]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20 shadow-neonBlue text-center space-y-6 my-8"
      >
        <div className="space-y-2">
          <Trophy size={48} className="mx-auto text-amber-400 animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.5))' }} />
          <h2 className="text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Game Completed
          </h2>
          <p className="text-sm text-gray-400">
            Winner declared: <span className="text-cyan-400 font-extrabold">{winner.username}</span> reached cell 100!
          </p>
        </div>

        {/* User Reward details if logged-in */}
        {rewards && rewards.length > 0 && (
          <div className="bg-cyan-950/20 border border-cyan-500/10 rounded-xl p-4 text-left space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-500/10 pb-1 flex items-center gap-1.5">
              <Award size={14} /> Rewards Gained
            </h4>
            {rewards.map((r) => (
              <div key={r.userId} className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-300 font-bold">
                  <span>{r.username}</span>
                  <div className="flex gap-3 text-[10px] font-mono">
                    <span className="text-amber-400">+{r.pointsEarned} Pts</span>
                    <span className="text-cyan-400">+{r.xpEarned} XP</span>
                    {r.levelUps > 0 && (
                      <span className="text-emerald-400 font-black tracking-wide animate-pulse">
                        Level Up! (Lv {r.newLevel})
                      </span>
                    )}
                  </div>
                </div>

                {/* Unlocked Achievements list */}
                {r.unlockedAchievements && r.unlockedAchievements.length > 0 && (
                  <div className="pl-2.5 border-l border-indigo-500/30 space-y-1 mt-1 text-[10px]">
                    <div className="text-indigo-400 font-bold uppercase tracking-wide">Achievements Unlocked:</div>
                    {r.unlockedAchievements.map((ach) => (
                      <div key={ach.id} className="flex items-center gap-1 text-gray-200">
                        <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                        <span>{ach.title} — {ach.desc} (+{ach.points} Pts)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Final Standings List */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 pl-1">Final Placements</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {rankings.map((p) => {
              const isAvatar = avatars.find(a => a.id === p.avatar) || avatars[0];
              const isFirst = p.rank === 1;

              return (
                <div
                  key={p.socketId || p.userId || p.username}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    isFirst
                      ? 'border-amber-500/30 bg-amber-950/10 shadow-neonGold'
                      : 'border-slate-800 bg-slate-900/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] ${
                      isFirst ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-gray-400'
                    }`}>
                      {p.rank}
                    </span>
                    <div className={`w-6 h-6 rounded-full border text-[8px] flex items-center justify-center font-bold uppercase ${isAvatar.color}`}>
                      {p.username.slice(0, 2)}
                    </div>
                    <span className={isFirst ? 'text-amber-400 font-extrabold' : 'text-gray-200'}>
                      {p.username}
                    </span>
                  </div>
                  <span className="font-mono text-gray-400 text-[10px]">Cell: {p.position}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-2">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold rounded-xl shadow-neonBlue hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
              <RotateCcw size={14} />
              Play Again
            </button>
          )}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-6 py-3 glass-panel text-cyan-400 hover:text-cyan-300 font-extrabold rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-slate-800/40 transition-all text-xs uppercase tracking-wider"
          >
            <Home size={14} />
            Back to Dashboard
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default MatchSummary;
