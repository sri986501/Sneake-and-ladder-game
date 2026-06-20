import React from 'react';
import { ShieldAlert, TrendingUp, History, ListCollapse, MessageSquare } from 'lucide-react';
import { getAvatars } from '../utils/boardHelper';

const GameHUD = ({ players, turnIndex, diceHistory, triggerInfo }) => {
  const avatars = getAvatars();

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      
      {/* Turn Indicator Banner */}
      <div className="glass-panel p-4 rounded-xl border-cyan-500/20 shadow-sm flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Turn</span>
          <span className="text-lg font-black text-cyan-400 uppercase tracking-wide">
            {players[turnIndex]?.username || 'Waiting...'}
          </span>
        </div>
        
        {players[turnIndex] && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold font-mono">Cell: {players[turnIndex].position}</span>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs uppercase animate-pulse ${
              avatars.find(a => a.id === players[turnIndex].avatar)?.color || 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
            }`}>
              {players[turnIndex].username.slice(0, 2)}
            </div>
          </div>
        )}
      </div>

      {/* Players Standing List */}
      <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
          <ListCollapse size={14} />
          Player Registry
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {players.map((p, idx) => {
            const isTurn = idx === turnIndex;
            const isAvatar = avatars.find(a => a.id === p.avatar) || avatars[0];
            return (
              <div
                key={p.socketId || p.userId || p.username}
                className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                  isTurn
                    ? 'border-cyan-500/30 bg-cyan-950/20 shadow-sm'
                    : 'border-slate-800/80 bg-slate-900/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full border text-[9px] flex items-center justify-center font-bold uppercase ${isAvatar.color}`}>
                    {p.username.slice(0, 2)}
                  </div>
                  <span className={`text-xs font-bold ${isTurn ? 'text-cyan-400' : 'text-gray-300'}`}>
                    {p.username} {p.isAI ? '(AI)' : ''}
                  </span>
                  <div className="flex gap-1">
                    {p.hasShield && <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-1 py-0.5 rounded font-extrabold uppercase">Shield</span>}
                    {p.isFrozen && <span className="text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 px-1 py-0.5 rounded font-extrabold uppercase animate-pulse">Frozen</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold font-mono">
                  <span className="text-gray-400">Pos: {p.position}</span>
                  <span className="text-gray-500">Rolls: {p.rollsCount || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Notifications / Log */}
      {triggerInfo && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-in text-left ${
          triggerInfo.type === 'snake' || triggerInfo.type === 'mine'
            ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            : triggerInfo.type === 'freeze'
            ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
            : triggerInfo.type === 'shield' || triggerInfo.type === 'shield_block'
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
        }`}>
          {triggerInfo.type === 'snake' || triggerInfo.type === 'mine' ? (
            <ShieldAlert size={20} className="shrink-0 animate-bounce" />
          ) : (
            <TrendingUp size={20} className="shrink-0 animate-bounce" />
          )}
          <div className="text-xs">
            <span className="font-extrabold uppercase">
              {triggerInfo.type === 'snake' ? 'Snake Bite!' :
               triggerInfo.type === 'mine' ? 'Gravity Mine Trap!' :
               triggerInfo.type === 'freeze' ? 'EMP Freeze Trap!' :
               triggerInfo.type === 'shield' ? 'Nanoshield Booster!' :
               triggerInfo.type === 'shield_block' ? 'Shield Blocked Snake!' :
               triggerInfo.type === 'speed' ? 'Hyperdrive Speed Boost!' :
               triggerInfo.type === 'double' ? 'Overclock Extra Turn!' :
               'Ladder Climb!'}
            </span>{' '}
            {triggerInfo.type === 'freeze' || triggerInfo.type === 'shield' || triggerInfo.type === 'double' ? (
              <span>Activated at cell <span className="font-extrabold font-mono">{triggerInfo.from}</span>.</span>
            ) : (
              <span>Relocated from <span className="font-bold font-mono">{triggerInfo.from}</span> to{' '}
              <span className="font-extrabold font-mono">{triggerInfo.to}</span>.</span>
            )}
          </div>
        </div>
      )}

      {/* Dice Roll History list */}
      <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
          <History size={14} />
          Battle Records
        </h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {diceHistory.length === 0 ? (
            <span className="text-xs text-gray-500 block py-2">No dice rolls registered.</span>
          ) : (
            [...diceHistory].reverse().map((h, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-medium text-gray-400 font-mono py-1 border-b border-slate-800/20">
                <span className="truncate max-w-[140px] text-gray-300 font-bold">{h.player}</span>
                <div className="flex gap-2">
                  <span>Rolled: <span className="text-cyan-400 font-extrabold">{h.roll}</span></span>
                  <span>({h.prev} ➔ {h.current})</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default GameHUD;
