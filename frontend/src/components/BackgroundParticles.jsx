import React from 'react';
import { motion } from 'framer-motion';

const BackgroundParticles = () => {
  // Generate random particles coords & delays
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -15
  }));

  return (
    <div className="fixed inset-0 -z-50 bg-[#1C120C] overflow-hidden pointer-events-none">
      {/* Dynamic gradient overlay to look like faded ink/shadows on old wood */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,27,18,0.2)_0%,rgba(15,10,6,0.95)_100%)]" />

      {/* Floating Vintage Dust Motes */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#D4AF37]/25 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -120],
            x: [0, Math.random() * 30 - 15],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}

      {/* Ornate Compass Line/Glow Overlay */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full border border-[#D4AF37]/5 -top-[200px] -left-[200px] pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(212,175,55,0.02)'
        }}
      />
    </div>
  );
};

export default BackgroundParticles;
