import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Bomb, Shield, Zap, Sparkles } from 'lucide-react';
import { getCellCoordinates, SNAKES, LADDERS, TRAPS, BOOSTERS, getAvatars } from '../utils/boardHelper';

// Helper to generate realistic wavy slithering coordinates for a snake
const getWavySnakePoints = (from, to, pointsCount = 40) => {
  const cHead = getCellCoordinates(from);
  const cTail = getCellCoordinates(to);
  const dx = cTail.x - cHead.x;
  const dy = cTail.y - cHead.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return Array(pointsCount + 1).fill(cHead);

  const nx = -dy / len;
  const ny = dx / len;

  // Calculate cycles (half waves) based on snake length. 
  // We use half-cycles and round to nearest 0.5 to keep head and tail at exactly 0 offset.
  const halfCycles = Math.round((1.5 + Math.min(2.5, len / 30)) * 2);
  const cycles = halfCycles / 2;
  
  // Wave amplitude: scales with length to keep proportions realistic
  const amplitude = Math.min(5.5, 2.0 + len * 0.05);
  
  // Vary the direction (left or right first) based on starting cell to give individual personality
  const directionMultiplier = from % 2 === 0 ? 1 : -1;

  const points = [];
  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    // Base linear position
    const bx = cHead.x + t * dx;
    const by = cHead.y + t * dy;

    // Smooth sine-based taper that is 0 at t=0 and t=1
    const taper = Math.sin(t * Math.PI);

    // Multi-wave sine pattern
    const wave = Math.sin(t * cycles * 2 * Math.PI);
    const offset = wave * amplitude * taper * directionMultiplier;

    const x = bx + nx * offset;
    const y = by + ny * offset;
    points.push({ x, y });
  }
  return points;
};

// Helper to generate step-wise bouncing coordinates for ladder climb
const getLadderClimbPoints = (from, to, pointsCount = 15) => {
  const c1 = getCellCoordinates(from);
  const c2 = getCellCoordinates(to);
  const points = [];
  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    let x = c1.x + t * (c2.x - c1.x);
    let y = c1.y + t * (c2.y - c1.y);

    // Perpendicular hop/bounce animation
    const hopCount = 4;
    const bounce = 1.0 * Math.abs(Math.sin(t * Math.PI * hopCount));

    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      const nx = -dy / len;
      const ny = dx / len;
      x += nx * bounce;
      y += ny * bounce;
    }
    points.push({ x, y });
  }
  return points;
};

const GameBoard = ({ players, turnIndex }) => {
  // Generate boustrophedon cell numbering: row-by-row from top (row 9) to bottom (row 0)
  const cellNumbers = [];
  for (let r = 9; r >= 0; r--) {
    for (let c = 0; c < 10; c++) {
      const cellNumber = r % 2 === 0
        ? r * 10 + c + 1
        : r * 10 + (9 - c) + 1;
      cellNumbers.push(cellNumber);
    }
  }

  const avatars = getAvatars();

  // Track previous player positions to detect transition changes (snakes or ladders)
  const prevPositionsRef = React.useRef({});

  React.useEffect(() => {
    players.forEach(p => {
      const key = p.socketId || p.userId || p.username;
      prevPositionsRef.current[key] = p.position;
    });
  });

  // Helper to get offset coordinates when multiple tokens are on the same cell
  const getPositionWithOffset = (cellNumber, playerIndex, totalPlayers) => {
    const center = getCellCoordinates(cellNumber);
    if (totalPlayers <= 1) return { x: center.x, y: center.y };

    // Arrange tokens in a circle or cross offset
    const angle = (playerIndex * 2 * Math.PI) / totalPlayers;
    const radius = 2.4; // percent offset radius
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    return { x, y };
  };

  // Selects custom animation transitions (0.8s for fast slide/climb)
  const getPlayerTransition = (isTransitioning) => {
    if (isTransitioning) {
      return {
        type: "tween",
        ease: "easeInOut",
        duration: 0.8
      };
    }

    return {
      type: "spring",
      stiffness: 180,
      damping: 16,
      mass: 0.7
    };
  };

  return (
    <div className="relative w-full max-w-[550px] aspect-square rounded-2xl p-3 bg-[#2D1D13] border-4 border-[#5C4033] shadow-2xl shadow-black/90">
      {/* 10x10 Grid Board */}
      <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-0.5 select-none relative z-10 border-2 border-[#5C4033] rounded overflow-hidden">
        {cellNumbers.map((num) => {
          const coordinates = getCellCoordinates(num);

          // Alternating soft parchment/cream paper background colors
          const cellColor = (coordinates.col + coordinates.row) % 2 === 0
            ? 'bg-[#FAF5EB]/95 border-[#E8D8C0]/25'
            : 'bg-[#F3EAD5]/95 border-[#E8D8C0]/25';

          return (
            <div
              key={num}
              id={`cell-${num}`}
              className={`border flex flex-col justify-between p-1 transition-all relative overflow-hidden group hover:border-[#D4AF37]/55 ${cellColor}`}
            >
              {/* Micro-glow wood/gold texture on hover */}
              <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/5 transition-colors pointer-events-none" />

              {/* Number display */}
              <span className={`text-[10px] font-bold font-serif self-start leading-none ${num === 100 ? 'text-[#8C2B2B] font-extrabold' :
                  num === 1 ? 'text-[#2E5A44] font-extrabold' : 'text-[#5C4033]/70'
                }`}>
                {num}
              </span>

              {/* Traps inside grid */}
              {TRAPS[num] && (
                <div className="absolute bottom-1 right-1 flex items-center justify-center pointer-events-none">
                  {TRAPS[num].type === 'freeze' ? (
                    <Snowflake className="w-3.5 h-3.5 text-sky-800/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] animate-pulse" title={TRAPS[num].label} />
                  ) : (
                    <Bomb className="w-3.5 h-3.5 text-stone-700/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" title={TRAPS[num].label} />
                  )}
                </div>
              )}

              {/* Boosters inside grid */}
              {BOOSTERS[num] && (
                <div className="absolute bottom-1 right-1 flex items-center justify-center pointer-events-none">
                  {BOOSTERS[num].type === 'shield' ? (
                    <Shield className="w-3.5 h-3.5 text-[#D4AF37] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" title={BOOSTERS[num].label} />
                  ) : BOOSTERS[num].type === 'speed' ? (
                    <Zap className="w-3.5 h-3.5 text-[#C5A059] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" title={BOOSTERS[num].label} />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-600/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] animate-pulse" title={BOOSTERS[num].label} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SVG Layer for Snakes & Ladders (viewBox scales coordinates 0-100 perfectly) */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {/* Render Ladders (Realistic 3D golden frames with bolt rivets and offset drop shadow) */}
        {Object.entries(LADDERS).map(([fromStr, to]) => {
          const from = parseInt(fromStr);
          const c1 = getCellCoordinates(from);
          const c2 = getCellCoordinates(to);

          // Parallel displacement offset math
          const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
          const offset = 0.6; // distance between side rails in percent
          const dx = offset * Math.sin(angle);
          const dy = -offset * Math.cos(angle);

          // Rungs spacing
          const rungs = [];
          const rungsCount = Math.max(3, Math.floor(Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2)) / 8));
          for (let i = 1; i < rungsCount; i++) {
            const t = i / rungsCount;
            const rx = c1.x + t * (c2.x - c1.x);
            const ry = c1.y + t * (c2.y - c1.y);
            rungs.push({ x1: rx - dx, y1: ry - dy, x2: rx + dx, y2: ry + dy });
          }

          return (
            <g key={`ladder-${from}`} style={{ filter: 'drop-shadow(2px 3.5px 1.5px rgba(0,0,0,0.75))' }}>
              {/* Rail Left Shadow/Base */}
              <line
                x1={c1.x - dx}
                y1={c1.y - dy}
                x2={c2.x - dx}
                y2={c2.y - dy}
                stroke="#451A03"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* Rail Left Core */}
              <line
                x1={c1.x - dx}
                y1={c1.y - dy}
                x2={c2.x - dx}
                y2={c2.y - dy}
                stroke="#D97706"
                strokeWidth="0.55"
                strokeLinecap="round"
              />
              {/* Rail Left Highlight */}
              <line
                x1={c1.x - dx}
                y1={c1.y - dy}
                x2={c2.x - dx}
                y2={c2.y - dy}
                stroke="#FCD34D"
                strokeWidth="0.25"
                strokeLinecap="round"
              />
              {/* Rail Left Flow Overlay */}
              <line
                x1={c1.x - dx}
                y1={c1.y - dy}
                x2={c2.x - dx}
                y2={c2.y - dy}
                stroke="#FFFFFF"
                strokeWidth="0.35"
                strokeDasharray="4 12"
                className="ladder-flow-path"
                opacity="0.8"
              />

              {/* Rail Right Shadow/Base */}
              <line
                x1={c1.x + dx}
                y1={c1.y + dy}
                x2={c2.x + dx}
                y2={c2.y + dy}
                stroke="#451A03"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* Rail Right Core */}
              <line
                x1={c1.x + dx}
                y1={c1.y + dy}
                x2={c2.x + dx}
                y2={c2.y + dy}
                stroke="#D97706"
                strokeWidth="0.55"
                strokeLinecap="round"
              />
              {/* Rail Right Highlight */}
              <line
                x1={c1.x + dx}
                y1={c1.y + dy}
                x2={c2.x + dx}
                y2={c2.y + dy}
                stroke="#FCD34D"
                strokeWidth="0.25"
                strokeLinecap="round"
              />
              {/* Rail Right Flow Overlay */}
              <line
                x1={c1.x + dx}
                y1={c1.y + dy}
                x2={c2.x + dx}
                y2={c2.y + dy}
                stroke="#FFFFFF"
                strokeWidth="0.35"
                strokeDasharray="4 12"
                className="ladder-flow-path"
                opacity="0.8"
              />

              {/* Connecting Rungs */}
              {rungs.map((r, idx) => (
                <g key={`rung-${from}-${idx}`}>
                  {/* Rung Shadow/Base */}
                  <line
                    x1={r.x1}
                    y1={r.y1}
                    x2={r.x2}
                    y2={r.y2}
                    stroke="#451A03"
                    strokeWidth="0.75"
                    opacity="0.9"
                  />
                  {/* Rung Gold Core */}
                  <line
                    x1={r.x1}
                    y1={r.y1}
                    x2={r.x2}
                    y2={r.y2}
                    stroke="#F59E0B"
                    strokeWidth="0.45"
                    opacity="0.95"
                  />
                  {/* Rung Highlight */}
                  <line
                    x1={r.x1}
                    y1={r.y1}
                    x2={r.x2}
                    y2={r.y2}
                    stroke="#FDE047"
                    strokeWidth="0.15"
                    opacity="0.95"
                  />
                  {/* Bolt Cap Left */}
                  <circle
                    cx={r.x1}
                    cy={r.y1}
                    r="0.32"
                    fill="#E2E8F0"
                    stroke="#475569"
                    strokeWidth="0.15"
                  />
                  <circle
                    cx={r.x1}
                    cy={r.y1}
                    r="0.08"
                    fill="#1E293B"
                  />
                  {/* Bolt Cap Right */}
                  <circle
                    cx={r.x2}
                    cy={r.y2}
                    r="0.32"
                    fill="#E2E8F0"
                    stroke="#475569"
                    strokeWidth="0.15"
                  />
                  <circle
                    cx={r.x2}
                    cy={r.y2}
                    r="0.08"
                    fill="#1E293B"
                  />
                </g>
              ))}
            </g>
          );
        })}

        {/* Render Snakes (Curved realistic serpents with heads, glowing eyes, forked tongues, scaly backs, rattlesnake tails, and offset shadow) */}
        {Object.entries(SNAKES).map(([fromStr, to]) => {
          const from = parseInt(fromStr);
          const cHead = getCellCoordinates(from); // snake head at top
          const cTail = getCellCoordinates(to); // snake tail at bottom

          // Generate wavy slithering points list
          const points = getWavySnakePoints(from, to);
          const pathD = points.map((pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`).join(' ');

          // Direction of tongue and eyes (estimated from tangent vector at the head)
          const headPt = points[0];
          const nextPt = points[1] || headPt;
          const hdx = headPt.x - nextPt.x;
          const hdy = headPt.y - nextPt.y;
          const hlen = Math.sqrt(hdx * hdx + hdy * hdy);

          const tdx = hlen > 0 ? hdx / hlen : 0;
          const tdy = hlen > 0 ? hdy / hlen : -1;
          const pdx = -tdy;
          const pdy = tdx;

          // Tongue math
          const tongueLen = 2.4;
          const tx = cHead.x + tdx * tongueLen;
          const ty = cHead.y + tdy * tongueLen;

          const forkSize = 0.85;
          const fx1 = tx + tdx * 0.9 + pdx * forkSize;
          const fy1 = ty + tdy * 0.9 + pdy * forkSize;
          const fx2 = tx + tdx * 0.9 - pdx * forkSize;
          const fy2 = ty + tdy * 0.9 - pdy * forkSize;

          const tongueD = `M ${cHead.x} ${cHead.y} L ${tx} ${ty} M ${tx} ${ty} L ${fx1} ${fy1} M ${tx} ${ty} L ${fx2} ${fy2}`;

          // Diamond-shaped viper/cobra head path
          const noseX = cHead.x + tdx * 2.2;
          const noseY = cHead.y + tdy * 2.2;
          const cheekLX = cHead.x + pdx * 1.7 - tdx * 0.4;
          const cheekLY = cHead.y + pdy * 1.7 - tdy * 0.4;
          const cheekRX = cHead.x - pdx * 1.7 - tdx * 0.4;
          const cheekRY = cHead.y - pdy * 1.7 - tdy * 0.4;
          const neckX = cHead.x - tdx * 1.8;
          const neckY = cHead.y - tdy * 1.8;

          const headPathD = `M ${noseX} ${noseY} Q ${cheekLX} ${cheekLY} ${neckX} ${neckY} Q ${cheekRX} ${cheekRY} ${noseX} ${noseY} Z`;

          // Eyes position
          const eyeShiftSide = 0.75;
          const eyeShiftForward = 0.35;
          const eyeX1 = cHead.x + pdx * eyeShiftSide + tdx * eyeShiftForward;
          const eyeY1 = cHead.y + pdy * eyeShiftSide + tdy * eyeShiftForward;
          const eyeX2 = cHead.x - pdx * eyeShiftSide + tdx * eyeShiftForward;
          const eyeY2 = cHead.y - pdy * eyeShiftSide + tdy * eyeShiftForward;

          // Rattlesnake tail math (estimated from tangent vector at the tail)
          const tailPt = points[points.length - 1];
          const prevTailPt = points[points.length - 2] || tailPt;
          const tailvdx = tailPt.x - prevTailPt.x;
          const tailvdy = tailPt.y - prevTailPt.y;
          const tailvlen = Math.sqrt(tailvdx * tailvdx + tailvdy * tailvdy);

          const tailtdx = tailvlen > 0 ? tailvdx / tailvlen : 0;
          const tailtdy = tailvlen > 0 ? tailvdy / tailvlen : 1;

          const rX1 = cTail.x + tailtdx * 0.6;
          const rY1 = cTail.y + tailtdy * 0.6;
          const rX2 = cTail.x + tailtdx * 1.2;
          const rY2 = cTail.y + tailtdy * 1.2;
          const rX3 = cTail.x + tailtdx * 1.8;
          const rY3 = cTail.y + tailtdy * 1.8;

          return (
            <g key={`snake-${from}`} style={{ filter: 'drop-shadow(1.5px 2.5px 1.5px rgba(0,0,0,0.8))' }}>
              {/* Red Forked Tongue */}
              <path
                d={tongueD}
                fill="none"
                stroke="#8C2B2B"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Snake body base path (dark volume backing) */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(45,29,19,0.95)"
                strokeWidth="2.3"
                strokeLinecap="round"
              />
              {/* Snake body main gradient path */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#snakeGrad)"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.95"
              />
              {/* Snake body scales overlay (dark natural scale pattern) */}
              <path
                d={pathD}
                fill="none"
                stroke="#1B140E"
                strokeWidth="1.65"
                strokeDasharray="1.0 2.2"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Snake body spine highlight stripe */}
              <path
                d={pathD}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="0.5"
                strokeDasharray="2.0 3.5"
                opacity="0.65"
              />

              {/* Rattlesnake tail segments */}
              <circle cx={rX1} cy={rY1} r="0.75" fill="#C5A059" stroke="#5C4033" strokeWidth="0.15" />
              <circle cx={rX2} cy={rY2} r="0.6" fill="#C5A059" stroke="#5C4033" strokeWidth="0.15" />
              <circle cx={rX3} cy={rY3} r="0.45" fill="#D4AF37" stroke="#5C4033" strokeWidth="0.15" />

              {/* Head Outline / Fill (Diamond viper shape) */}
              <path
                d={headPathD}
                fill="url(#snakeGrad)"
                stroke="rgba(45,29,19,0.95)"
                strokeWidth="0.45"
              />

              {/* Glowing Red Eyes */}
              <circle
                cx={eyeX1}
                cy={eyeY1}
                r="0.45"
                fill="#8C2B2B"
              />
              <circle
                cx={eyeX2}
                cy={eyeY2}
                r="0.45"
                fill="#8C2B2B"
              />
            </g>
          );
        })}

        {/* Python/Viper Realistic Gradient for Snake curves */}
        <defs>
          <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E5A44" />
            <stop offset="50%" stopColor="#1C3827" />
            <stop offset="100%" stopColor="#513621" />
          </linearGradient>
        </defs>
      </svg>

      {/* Render Player Tokens Overlay (Positioned absolutely via left/top percentage) */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {players.map((p, idx) => {
            const key = p.socketId || p.userId || p.username;
            const prevPos = prevPositionsRef.current[key] || p.position;
            const currentPos = p.position;

            let animateLeft, animateTop;
            let isTransitioning = false;

            if (prevPos !== currentPos) {
              if (SNAKES[prevPos] === currentPos) {
                isTransitioning = true;
                const pts = getWavySnakePoints(prevPos, currentPos);
                animateLeft = pts.map(pt => `${pt.x}%`);
                animateTop = pts.map(pt => `${pt.y}%`);
              } else if (LADDERS[prevPos] === currentPos) {
                isTransitioning = true;
                const pts = getLadderClimbPoints(prevPos, currentPos);
                animateLeft = pts.map(pt => `${pt.x}%`);
                animateTop = pts.map(pt => `${pt.y}%`);
              }
            }

            if (!isTransitioning) {
              const coords = getPositionWithOffset(currentPos, idx, players.length);
              animateLeft = `${coords.x}%`;
              animateTop = `${coords.y}%`;
            }

            const isTurn = idx === turnIndex;

            return (
              <motion.div
                key={key}
                initial={{ scale: 0, left: "5%", top: "95%" }}
                animate={{
                  scale: 1,
                  left: animateLeft,
                  top: animateTop
                }}
                transition={getPlayerTransition(isTransitioning)}
                className={`absolute w-[5%] h-[5%] -ml-[2.5%] -mt-[2.5%] flex items-center justify-center ${isTurn ? 'animate-bounce z-40' : 'z-30'}`}
              >
                {/* 3D Cyber Coin Wrapper */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg relative select-none transition-all duration-300 ${
                    p.avatar === 'avatar1' ? 'bg-gradient-to-br from-[#E5C158] to-[#9E7815] border-[#5C4033] text-[#FAF5EB]' :
                    p.avatar === 'avatar2' ? 'bg-gradient-to-br from-[#7D5A3E] to-[#3B2516] border-[#1F140E] text-[#FAF5EB]' :
                    p.avatar === 'avatar3' ? 'bg-gradient-to-br from-[#8C2B2B] to-[#4C1212] border-[#2D1D13] text-[#FAF5EB]' :
                    p.avatar === 'avatar4' ? 'bg-gradient-to-br from-[#FAF5EB] to-[#C5B396] border-[#5C4033] text-[#2D1D13]' :
                    'bg-gradient-to-br from-[#2E5A44] to-[#142D20] border-[#132D1D] text-[#FAF5EB]'
                  } ${isTurn ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#2D1D13] scale-110' : ''}`}
                  style={{
                    borderBottomWidth: '3.5px',
                    borderRightWidth: '2.8px',
                  }}
                >
                  {/* Coin Inner Ridge Pattern */}
                  <div className="absolute inset-[1.5px] rounded-full border border-white/10 flex items-center justify-center bg-black/35 backdrop-blur-[0.5px]">
                    {/* Unique Glyph in center based on avatar (styled with vintage bronze/parchment colors) */}
                    {p.avatar === 'avatar1' ? (
                      /* Shuriken / Star */
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]/30 animate-spin-slow">
                        <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
                      </svg>
                    ) : p.avatar === 'avatar2' ? (
                      /* Cobra / Snake winding S shape */
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#FAF5EB] fill-none stroke-current stroke-2">
                        <path d="M12 2a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z M12 14c-2 0-4 2-4 4s2 4 4 4s4-2 4-4s-2-4-4-4z" />
                      </svg>
                    ) : p.avatar === 'avatar3' ? (
                      /* Mech Cog / Gear */
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#FAF5EB] fill-none stroke-current stroke-2 animate-spin-slow">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v4M12 18v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8" />
                      </svg>
                    ) : p.avatar === 'avatar4' ? (
                      /* Target / Circuit Node */
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2D1D13] fill-none stroke-current stroke-2">
                        <circle cx="12" cy="12" r="8" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    ) : (
                      /* CPU Chip node */
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#FAF5EB] fill-none stroke-current stroke-2">
                        <rect x="6" y="6" width="12" height="12" rx="1.5" />
                        <path d="M9 6V4M15 6V4M9 20v-2M15 20v-2M6 9H4M6 15H4M20 9h-2M20 15h-2" />
                      </svg>
                    )}
                  </div>

                  {/* Callsign initials overlay in corner */}
                  <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-[#1C120C] border border-[#D4AF37]/45 text-[#FAF5EB] px-0.5 rounded leading-none uppercase">
                    {p.username.slice(0, 2)}
                  </span>

                  {/* Shield Visual Barrier Overlay */}
                  {p.hasShield && (
                    <span className="absolute -inset-1.5 rounded-full border-2 border-[#D4AF37] border-dashed animate-pulse-slow" />
                  )}

                  {/* Freeze Block Visual Overlay */}
                  {p.isFrozen && (
                    <span className="absolute inset-0 bg-[#5C4033]/65 rounded-full border border-[#2D1D13] shadow-inner" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default GameBoard;
