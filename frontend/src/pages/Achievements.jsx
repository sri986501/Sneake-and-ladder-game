import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, ShieldAlert, TrendingUp, Gamepad2, Zap, Crown, Award, CheckCircle } from 'lucide-react';
import soundManager from '../utils/soundManager';

const Achievements = () => {
  const { user } = useSelector((state) => state.auth);

  // Static list matching the seeder definitions
  const achievementsList = [
    {
      id: 'first_victory',
      title: 'First Victory',
      description: 'Win your first match inside the Arena',
      rewardPoints: 50,
      icon: Trophy,
      glow: 'shadow-neonGold border-amber-500/30 text-amber-400 bg-amber-950/15'
    },
    {
      id: 'snake_survivor',
      title: 'Snake Survivor',
      description: 'Survive and escape snakes 10 times',
      rewardPoints: 100,
      icon: ShieldAlert,
      glow: 'shadow-neonBlue border-cyan-500/30 text-cyan-400 bg-cyan-950/15'
    },
    {
      id: 'ladder_master',
      title: 'Ladder Master',
      description: 'Climb 15 ladders successfully',
      rewardPoints: 100,
      icon: TrendingUp,
      glow: 'shadow-neonPurple border-purple-500/30 text-purple-400 bg-purple-950/15'
    },
    {
      id: 'games_100',
      title: 'Centurion',
      description: 'Complete 100 games in the Arena',
      rewardPoints: 150,
      icon: Gamepad2,
      glow: 'shadow-neonBlue border-sky-500/30 text-sky-400 bg-sky-950/15'
    },
    {
      id: 'win_streak_10',
      title: 'Unstoppable',
      description: 'Reach a win streak of 10 matches',
      rewardPoints: 200,
      icon: Zap,
      glow: 'shadow-neonGold border-yellow-500/30 text-yellow-400 bg-yellow-950/15'
    },
    {
      id: 'champion',
      title: 'Arena Champion',
      description: 'Secure 10 victories in the Arena',
      rewardPoints: 150,
      icon: Crown,
      glow: 'shadow-neonPurple border-indigo-500/30 text-indigo-400 bg-indigo-950/15'
    },
    {
      id: 'legend',
      title: 'Legendary Climber',
      description: 'Secure 50 victories in the Arena',
      rewardPoints: 300,
      icon: Award,
      glow: 'shadow-neonGold border-amber-500/30 text-amber-400 bg-amber-950/15'
    },
    {
      id: 'grand_master',
      title: 'Grand Master',
      description: 'Secure 100 victories in the Arena',
      rewardPoints: 500,
      icon: ShieldAlert,
      glow: 'shadow-neonPurple border-rose-500/30 text-rose-400 bg-rose-950/15'
    }
  ];

  // Map unlocked achievements from user profile
  const userUnlocked = user?.achievements || [];
  const unlockedIds = userUnlocked.map(a => a.achievementId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left space-y-2">
        <h2 className="text-4xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
          Achievements Room
        </h2>
        <p className="text-sm text-gray-400">
          Unlock achievements to claim Arena Points. Progress: {unlockedIds.length} / {achievementsList.length} Unlocked.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {achievementsList.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const unlockInfo = userUnlocked.find(a => a.achievementId === ach.id);
          const Icon = ach.icon;

          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: isUnlocked ? -4 : 0 }}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-56 transition-all duration-300 relative overflow-hidden ${
                isUnlocked 
                  ? `${ach.glow} glass-panel` 
                  : 'border-slate-800 bg-slate-950/40 text-gray-500 opacity-60'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-3 right-3 text-emerald-400 animate-pulse" title="Unlocked">
                  <CheckCircle size={16} />
                </div>
              )}

              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  isUnlocked ? 'border-current' : 'border-slate-800 bg-slate-900/20'
                }`}>
                  <Icon size={24} />
                </div>

                <div className="space-y-1">
                  <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-tight">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800/40">
                <span className="text-[10px] font-mono">
                  {isUnlocked && unlockInfo
                    ? `Unlocked: ${new Date(unlockInfo.unlockedAt).toLocaleDateString()}`
                    : 'Locked Challenge'}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded ${
                  isUnlocked ? 'bg-cyan-950/50 text-cyan-400' : 'bg-slate-900 text-gray-500'
                }`}>
                  +{ach.rewardPoints} Pts
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
