import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, Shield, Zap } from 'lucide-react';
import { navigateTo } from '../store/gameSlice';
import soundManager from '../utils/soundManager';

const LandingPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handlePlayNow = () => {
    soundManager.playClick();
    if (isAuthenticated) {
      dispatch(navigateTo('play'));
    } else {
      // Allow them to navigate to register or play as guest (play screen supports guests)
      dispatch(navigateTo('play'));
    }
  };

  const handleViewRankings = () => {
    soundManager.playClick();
    dispatch(navigateTo('leaderboard'));
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-serif">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Side - Hero Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col text-left space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/20 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-xs uppercase tracking-wider w-fit shadow-md">
            <Zap size={12} className="animate-pulse" />
            ⚜️ The Chronicles of Old ⚜️
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none uppercase">
            <span className="block text-white font-serif">Snakes &</span>
            <span className="block text-neonBlue font-black font-serif mt-2 drop-shadow-lg">
              Ladders
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-300 max-w-lg leading-relaxed font-sans italic">
            Climb the Ladder. Escape the Serpent. Rule the Leaderboard. Step into the ultimate hand-crafted vintage board game adventure.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handlePlayNow}
              className="flex items-center gap-2 px-8 py-4 bg-neonBlue hover:bg-[#C5A059] text-[#1C120C] font-black rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all duration-300 text-lg uppercase tracking-wider"
            >
              <Play fill="#1C120C" size={20} />
              Begin Quest
            </button>
            <button
              onClick={handleViewRankings}
              className="flex items-center gap-2 px-8 py-4 glass-panel text-[#D4AF37] hover:text-[#FAF5EB] font-bold rounded-xl border border-[#8C6D4C]/30 hover:border-[#D4AF37] hover:bg-stone-900 transition-all duration-300 text-lg uppercase tracking-wider"
            >
              <Trophy size={20} />
              Hall of Fame
            </button>
          </div>

          {/* Key Features Icons */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#5C4033] max-w-lg font-sans">
            <div className="flex flex-col items-start gap-1">
              <Users size={20} className="text-[#C5A059] mb-1" />
              <span className="font-bold text-gray-200 text-sm">Multiplayer</span>
              <span className="text-xs text-stone-400">Play Online or Local</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Trophy size={20} className="text-neonBlue mb-1" />
              <span className="font-bold text-gray-200 text-sm">Leaderboards</span>
              <span className="text-xs text-stone-400">Earn daily/weekly XP</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Shield size={20} className="text-[#8C2B2B] mb-1" />
              <span className="font-bold text-gray-200 text-sm">Achievements</span>
              <span className="text-xs text-stone-400">Unlock unique badges</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Floating 3D Board Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:flex justify-center items-center h-[500px]"
        >
          {/* Glowing background halo */}
          <div className="absolute w-72 h-72 rounded-full bg-[#D4AF37]/5 blur-[60px] animate-pulse-slow" />
          
          {/* Animated 3D board mockup */}
          <div 
            className="w-[340px] h-[340px] rounded-2xl p-4 bg-[#2D1D13] border-4 border-[#8C6D4C] shadow-2xl transition-all duration-500 hover:rotate-x-[50deg] hover:rotate-z-[-20deg]"
            style={{
              transform: 'rotateX(55deg) rotateZ(-25deg) translateY(-20px)',
              transformStyle: 'preserve-3d',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Grid Cells (5x5 mock) */}
            <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-1 select-none border border-[#5C4033] rounded-lg overflow-hidden">
              {Array.from({ length: 25 }).map((_, i) => {
                const colors = [
                  'border-[#E8D8C0]/35 bg-[#FAF5EB]',
                  'border-[#E8D8C0]/35 bg-[#FAF5EB]',
                  'border-[#DCD0B7]/35 bg-[#F3EAD5]',
                  'border-[#DCD0B7]/35 bg-[#F3EAD5]'
                ];
                const selectedColor = colors[(i + Math.floor(i / 5)) % 4];
                return (
                  <div 
                    key={i} 
                    className={`border-[0.5px] flex items-center justify-center font-bold text-xs text-[#8C6D4C] font-serif ${selectedColor}`}
                    style={{ transform: 'translateZ(10px)' }}
                  >
                    {25 - i}
                  </div>
                );
              })}
            </div>

            {/* Antique lines for Ladder and Snake mock */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'translateZ(15px)' }}>
              {/* Ladder (Wood Brown) */}
              <line x1="20%" y1="80%" x2="60%" y2="20%" stroke="#8C6D4C" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
              <line x1="25%" y1="80%" x2="65%" y2="20%" stroke="#8C6D4C" strokeWidth="4" strokeLinecap="round" />
              
              {/* Serpent (Forest Green) */}
              <path d="M 80,40 Q 150,150 220,260" fill="none" stroke="#2E5A44" strokeWidth="4.5" strokeLinecap="round" className="animate-pulse" />
            </svg>

            {/* Wooden Tokens */}
            <div 
              className="absolute w-5 h-5 rounded-full bg-[#D4AF37] border-2 border-[#5C4033] shadow-md bottom-20 left-12 animate-bounce"
              style={{ transform: 'translateZ(25px)' }}
            />
            <div 
              className="absolute w-5 h-5 rounded-full bg-[#8C2B2B] border-2 border-[#4E1A1A] shadow-md top-28 right-24 animate-bounce"
              style={{ transform: 'translateZ(25px)', animationDelay: '0.3s' }}
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default LandingPage;
