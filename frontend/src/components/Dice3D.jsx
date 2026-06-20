import React, { useEffect, useState } from 'react';
import soundManager from '../utils/soundManager';

const Dice3D = ({ result, isRolling, onClick, disabled }) => {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [internalRolling, setInternalRolling] = useState(false);

  const faceRotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: 180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 }
  };

  useEffect(() => {
    if (isRolling) {
      soundManager.playDiceRoll();
      setInternalRolling(true);
      // Propose random spinning angles
      const extraX = 720 + Math.floor(Math.random() * 4) * 90;
      const extraY = 720 + Math.floor(Math.random() * 4) * 90;
      setRotX(extraX);
      setRotY(extraY);

      // Snap to target face internally after 1200ms spinning animation finishes
      const timer = setTimeout(() => {
        if (result) {
          const target = faceRotations[result] || faceRotations[1];
          setRotX(target.x);
          setRotY(target.y);
        }
        setInternalRolling(false);
      }, 1200);

      return () => clearTimeout(timer);
    } else if (result) {
      // Snap to exact target face rotation once rolling finishes
      const target = faceRotations[result] || faceRotations[1];
      setRotX(target.x);
      setRotY(target.y);
      setInternalRolling(false);
    }
  }, [isRolling, result]);

  const handleRoll = () => {
    if (disabled || internalRolling || isRolling) return;
    onClick();
  };

  const getDots = (num) => {
    // Return dots mapped inside the grid for visual look
    const gridPositions = {
      1: ['e'],
      2: ['a', 'i'],
      3: ['a', 'e', 'i'],
      4: ['a', 'c', 'g', 'i'],
      5: ['a', 'c', 'e', 'g', 'i'],
      6: ['a', 'c', 'd', 'f', 'g', 'i']
    };

    const activeDots = gridPositions[num] || [];
    const positions = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

    return positions.map((pos) => {
      const active = activeDots.includes(pos);
      return (
        <div key={pos} style={{ gridArea: pos }}>
          {active && <div className="dice-dot" />}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div 
        onClick={handleRoll}
        className={`dice-scene ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'
        }`}
      >
        <div 
          className="dice"
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: internalRolling ? 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.4s ease-out'
          }}
        >
          {/* Face 1 */}
          <div className="dice-face dice-face-1">{getDots(1)}</div>
          {/* Face 2 */}
          <div className="dice-face dice-face-2">{getDots(2)}</div>
          {/* Face 3 */}
          <div className="dice-face dice-face-3">{getDots(3)}</div>
          {/* Face 4 */}
          <div className="dice-face dice-face-4">{getDots(4)}</div>
          {/* Face 5 */}
          <div className="dice-face dice-face-5">{getDots(5)}</div>
          {/* Face 6 */}
          <div className="dice-face dice-face-6">{getDots(6)}</div>
        </div>
      </div>

      {disabled ? (
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-serif">Opponent Turn</span>
      ) : (
        <span className="text-[10px] uppercase font-bold text-neonBlue tracking-wider animate-pulse font-serif">Click to Roll</span>
      )}
    </div>
  );
};

export default Dice3D;
