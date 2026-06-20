import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { 
  navigateTo, setGameMode, setRoomCode, setSocketConnected, setRoomData, 
  updateRoomPlayers, addChatMessage, startOfflineGame, setRolling, startRoll, applyDiceRoll, resetGame
} from '../store/gameSlice';
import GameBoard from '../components/GameBoard';
import Dice3D from '../components/Dice3D';
import GameHUD from '../components/GameHUD';
import MatchSummary from '../components/MatchSummary';
import RoomChat from '../components/RoomChat';
import { SNAKES, LADDERS, TRAPS, BOOSTERS, getAvatars } from '../utils/boardHelper';
import soundManager from '../utils/soundManager';
import { Play, Users, Cpu, ShieldAlert, Copy, RefreshCw, Send, LogOut } from 'lucide-react';

const PlayPage = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { 
    gameMode, roomCode, players, turnIndex, isStarted, winner, diceResult, isRolling, 
    chat, diceHistory, triggerInfo, hostId, socketConnected 
  } = useSelector((state) => state.game);

  // Connection settings
  const API_URL = 'http://localhost:5000';
  const [socket, setSocket] = useState(null);

  // Setup options states
  const [playersCount, setPlayersCount] = useState(2);
  const [localNames, setLocalNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [localAvatars, setLocalAvatars] = useState(['avatar1', 'avatar2', 'avatar3', 'avatar4']);
  const [localTypes, setLocalTypes] = useState(['human', 'human', 'ai', 'ai']);
  const [showRules, setShowRules] = useState(false);
  
  // Lobby join states
  const [inputCode, setInputCode] = useState('');
  const [maxPlayersOnline, setMaxPlayersOnline] = useState(2);
  const [onlineError, setOnlineError] = useState('');

  // Post match reward logs
  const [rewardsLog, setRewardsLog] = useState(null);

  // Match timers
  const [matchStartTime, setMatchStartTime] = useState(null);

  // Local component-level positioning state to support stepping animations smoothly
  const [animatedPlayers, setAnimatedPlayers] = useState([]);

  const avatarsList = getAvatars();

  // Initialize animatedPlayers when redux players change
  useEffect(() => {
    setAnimatedPlayers(players);
  }, [players]);

  // Establish socket connection for Online mode
  useEffect(() => {
    if (gameMode === 'online' && !socket) {
      const socketInstance = io(API_URL, {
        withCredentials: true,
        transports: ['websocket']
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        dispatch(setSocketConnected(true));
      });

      socketInstance.on('disconnect', () => {
        dispatch(setSocketConnected(false));
      });

      socketInstance.on('room_created', (data) => {
        dispatch(setRoomData(data.room));
        setMatchStartTime(Date.now());
      });

      socketInstance.on('room_update', (room) => {
        dispatch(setRoomData(room));
      });

      socketInstance.on('receive_message', (msg) => {
        dispatch(addChatMessage(msg));
      });

      socketInstance.on('error_message', (err) => {
        setOnlineError(err);
      });

      socketInstance.on('game_started', (room) => {
        dispatch(setRoomData(room));
        setMatchStartTime(Date.now());
      });

      socketInstance.on('dice_rolled', (data) => {
        // Socket dice roll triggered
        dispatch(startRoll(data.rollVal));
        
        setTimeout(() => {
          const playerIdx = data.room.players.findIndex(p => p.socketId === data.player.socketId);
          if (playerIdx !== -1) {
            animateStepper(
              playerIdx,
              data.prevPosition,
              data.intermediatePosition,
              data.finalPosition,
              data.triggerType,
              data.rollVal,
              true,
              data.gotExtraTurn,
              data.turnIndex
            );
          }
        }, 1200);
      });

      socketInstance.on('game_ended', (data) => {
        // Stop rolling and update room winner
        dispatch(setRoomData(data.room));
        
        // Log match results from Host side
        if (data.room.hostId === socketInstance.id) {
          logOnlineMatch(data.rankings);
        }
      });

      return () => {
        socketInstance.disconnect();
        dispatch(setSocketConnected(false));
      };
    }
  }, [gameMode]);

  // AI thinking turn loop
  useEffect(() => {
    if ((gameMode === 'single' || gameMode === 'local') && isStarted && !winner && players[turnIndex]?.isAI && !isRolling) {
      const aiTimer = setTimeout(() => {
        handleOfflineRoll();
      }, 1000); // AI thinking duration (1.0s)
      return () => clearTimeout(aiTimer);
    }
  }, [gameMode, isStarted, turnIndex, winner, isRolling, players]);

  // Log completed Online matches in Database
  const logOnlineMatch = async (rankings) => {
    if (!token) return;
    const duration = Math.round((Date.now() - matchStartTime) / 1000);
    
    try {
      const res = await fetch(`http://localhost:5000/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          matchMode: 'online',
          players: rankings.map(r => ({
            userId: r.userId,
            username: r.username,
            avatar: r.avatar,
            rank: r.rank,
            ladderClimbs: r.ladderClimbs,
            snakeEscapes: r.snakeEscapes,
            rollsCount: r.rollsCount
          })),
          winner: {
            userId: rankings[0].userId,
            username: rankings[0].username
          },
          duration,
          moves: rankings.reduce((acc, curr) => acc + (curr.rollsCount || 0), 0)
        })
      });
      const data = await res.json();
      if (data.success) {
        setRewardsLog(data.rewards);
      }
    } catch (e) {
      console.error('Failed logging match outcome', e);
    }
  };

  // Log completed Offline matches (Single / Local)
  const logOfflineMatch = async (finalRankings) => {
    if (!token) return;
    const duration = Math.round((Date.now() - matchStartTime) / 1000);

    // Filter to check if primary player is logged-in
    const activeUserPlayer = finalRankings.find(r => r.userId === user._id);
    if (!activeUserPlayer) return;

    try {
      const res = await fetch(`http://localhost:5000/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          matchMode: gameMode,
          players: finalRankings.map(r => ({
            userId: r.userId || null,
            username: r.username,
            avatar: r.avatar,
            rank: r.rank,
            ladderClimbs: r.ladderClimbs,
            snakeEscapes: r.snakeEscapes,
            rollsCount: r.rollsCount
          })),
          winner: {
            userId: finalRankings[0].userId || null,
            username: finalRankings[0].username
          },
          duration,
          moves: finalRankings.reduce((acc, curr) => acc + (curr.rollsCount || 0), 0)
        })
      });
      const data = await res.json();
      if (data.success) {
        setRewardsLog(data.rewards);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Stepping cell animation handler for both Offline and Online Modes
  const animateStepper = (playerIdx, start, intermediate, final, triggerType, rollVal, isOnline = false, gotExtraTurn = false, nextTurnIndex = 0) => {
    let currentPos = start;
    const interval = setInterval(() => {
      if (currentPos < intermediate) {
        currentPos++;
        setAnimatedPlayers(prev => {
          const next = [...prev];
          if (next[playerIdx]) next[playerIdx] = { ...next[playerIdx], position: currentPos };
          return next;
        });
      } else {
        clearInterval(interval);
        
        // Apply trigger transitions (snake slide down, ladder climb up, traps/boosters)
        if (triggerType) {
          if (triggerType === 'snake' || triggerType === 'ladder' || triggerType === 'shield_block') {
            // Smooth paths for snakes and ladders
            setTimeout(() => {
              if (triggerType === 'snake') soundManager.playSnakeBite();
              else if (triggerType === 'ladder') soundManager.playLadderClimb();

              setAnimatedPlayers(prev => {
                const next = [...prev];
                if (next[playerIdx]) next[playerIdx] = { ...next[playerIdx], position: final };
                return next;
              });

              setTimeout(() => {
                if (isOnline) {
                  dispatch(applyDiceRoll({
                    rollVal,
                    prevPosition: start,
                    intermediatePosition: intermediate,
                    finalPosition: final,
                    triggerType,
                    gotExtraTurn,
                    nextTurnIndex
                  }));
                } else {
                  applyOfflineTurnCommit(playerIdx, start, intermediate, final, triggerType, rollVal);
                }
              }, 800);
            }, 250);
          } else if (triggerType === 'mine' || triggerType === 'speed') {
            // Step-by-step stepping for mine/speed traps and boosters
            setTimeout(() => {
              if (triggerType === 'mine') soundManager.playTrap();
              else if (triggerType === 'speed') soundManager.playBooster();

              let triggerPos = intermediate;
              const triggerInterval = setInterval(() => {
                if (triggerPos < final) {
                  triggerPos++;
                  setAnimatedPlayers(prev => {
                    const next = [...prev];
                    if (next[playerIdx]) next[playerIdx] = { ...next[playerIdx], position: triggerPos };
                    return next;
                  });
                } else if (triggerPos > final) {
                  triggerPos--;
                  setAnimatedPlayers(prev => {
                    const next = [...prev];
                    if (next[playerIdx]) next[playerIdx] = { ...next[playerIdx], position: triggerPos };
                    return next;
                  });
                } else {
                  clearInterval(triggerInterval);
                  setTimeout(() => {
                    if (isOnline) {
                      dispatch(applyDiceRoll({
                        rollVal,
                        prevPosition: start,
                        intermediatePosition: intermediate,
                        finalPosition: final,
                        triggerType,
                        gotExtraTurn,
                        nextTurnIndex
                      }));
                    } else {
                      applyOfflineTurnCommit(playerIdx, start, intermediate, final, triggerType, rollVal);
                    }
                  }, 400);
                }
              }, 100);
            }, 250);
          } else {
            // Status-only triggers (freeze, shield, double) where position doesn't change
            setTimeout(() => {
              if (triggerType === 'freeze') soundManager.playTrap();
              else soundManager.playBooster();

              setAnimatedPlayers(prev => {
                const next = [...prev];
                if (next[playerIdx]) next[playerIdx] = { ...next[playerIdx], position: final };
                return next;
              });

              setTimeout(() => {
                if (isOnline) {
                  dispatch(applyDiceRoll({
                    rollVal,
                    prevPosition: start,
                    intermediatePosition: intermediate,
                    finalPosition: final,
                    triggerType,
                    gotExtraTurn,
                    nextTurnIndex
                  }));
                } else {
                  applyOfflineTurnCommit(playerIdx, start, intermediate, final, triggerType, rollVal);
                }
              }, 400);
            }, 250);
          }
        } else {
          // No triggers - simple dice roll movement
          if (isOnline) {
            dispatch(applyDiceRoll({
              rollVal,
              prevPosition: start,
              intermediatePosition: intermediate,
              finalPosition: final,
              triggerType: null,
              gotExtraTurn,
              nextTurnIndex
            }));
          } else {
            applyOfflineTurnCommit(playerIdx, start, intermediate, final, null, rollVal);
          }
        }
      }
    }, 100);
  };

  const applyOfflineTurnCommit = (playerIdx, prevPos, intermediatePos, finalPos, triggerType, rollVal) => {
    let extraTurn = rollVal === 6 && finalPos !== 100;
    let nextIndex = turnIndex;
    if (!extraTurn && finalPos !== 100) {
      nextIndex = (turnIndex + 1) % players.length;
    }

    dispatch(applyDiceRoll({
      rollVal,
      prevPosition: prevPos,
      intermediatePosition: intermediatePos,
      finalPosition: finalPos,
      triggerType,
      gotExtraTurn: extraTurn,
      nextTurnIndex: nextIndex
    }));

    // Trigger victory logs if someone wins
    if (finalPos === 100) {
      // Calculate final ranks
      const finalRanks = [...players].map((p, idx) => {
        if (idx === playerIdx) return { ...p, position: 100 };
        return { ...p };
      }).sort((a, b) => b.position - a.position);

      finalRanks.forEach((r, idx) => { r.rank = idx + 1; });
      logOfflineMatch(finalRanks);
    }
  };

  const handleOfflineRoll = () => {
    if (isRolling || winner) return;

    const activeIdx = turnIndex;
    const p = players[activeIdx];
    const roll = Math.floor(Math.random() * 6) + 1;
    dispatch(startRoll(roll));

    // Wait for the 3D dice spinning duration
    setTimeout(() => {
      const prev = p.position;
      let nextPos = prev + roll;
      let intermediate = nextPos;
      let final = nextPos;
      let trigger = null;

      if (nextPos > 100) {
        intermediate = prev;
        final = prev;
      } else if (nextPos === 100) {
        final = 100;
      } else {
        if (SNAKES[nextPos]) {
          if (p.hasShield) {
            intermediate = nextPos;
            final = nextPos;
            trigger = 'shield_block';
          } else {
            intermediate = nextPos;
            final = SNAKES[nextPos];
            trigger = 'snake';
          }
        } else if (LADDERS[nextPos]) {
          intermediate = nextPos;
          final = LADDERS[nextPos];
          trigger = 'ladder';
        } else if (TRAPS[nextPos]) {
          const trap = TRAPS[nextPos];
          intermediate = nextPos;
          trigger = trap.type;
          if (trap.type === 'mine') {
            final = Math.max(1, nextPos - 3);
          } else {
            final = nextPos;
          }
        } else if (BOOSTERS[nextPos]) {
          const booster = BOOSTERS[nextPos];
          intermediate = nextPos;
          trigger = booster.type;
          if (booster.type === 'speed') {
            final = Math.min(100, nextPos + 4);
          } else {
            final = nextPos;
          }
        }
      }

      animateStepper(activeIdx, prev, intermediate, final, trigger, roll);
    }, 1200);
  };

  // Socket online roll emitter
  const handleOnlineRoll = () => {
    if (isRolling || winner || !socket) return;
    socket.emit('roll_dice', { roomCode });
  };

  // Lobby actions
  const createOnlineRoom = () => {
    if (!socket) return;
    setOnlineError('');
    socket.emit('create_room', {
      maxPlayers: maxPlayersOnline,
      user
    });
  };

  const joinOnlineRoom = () => {
    if (!socket || !inputCode.trim()) return;
    setOnlineError('');
    socket.emit('join_room', {
      roomCode: inputCode.trim(),
      user
    });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit('toggle_ready', { roomCode });
  };

  const handleStartOnlineGame = () => {
    if (!socket) return;
    socket.emit('start_game', { roomCode });
  };

  // Setup options committers
  const startSinglePlayerSetup = () => {
    soundManager.playClick();
    const pList = [
      {
        userId: user?._id || null,
        username: user?.username || 'Pilot',
        avatar: user?.avatar || 'avatar1',
        position: 1,
        rollsCount: 0,
        ladderClimbs: 0,
        snakeEscapes: 0,
        isAI: false
      },
      {
        username: 'Mecha AI',
        avatar: 'avatar3',
        position: 1,
        rollsCount: 0,
        ladderClimbs: 0,
        snakeEscapes: 0,
        isAI: true
      }
    ];

    dispatch(startOfflineGame({ players: pList, gameMode: 'single' }));
    setMatchStartTime(Date.now());
  };

  const startLocalSetup = () => {
    soundManager.playClick();
    const pList = Array.from({ length: playersCount }).map((_, idx) => ({
      userId: idx === 0 && user ? user._id : null,
      username: localNames[idx] || (localTypes[idx] === 'ai' ? `Robot AI ${idx + 1}` : `Player ${idx + 1}`),
      avatar: localAvatars[idx] || `avatar${idx + 1}`,
      position: 1,
      rollsCount: 0,
      ladderClimbs: 0,
      snakeEscapes: 0,
      isAI: localTypes[idx] === 'ai'
    }));

    dispatch(startOfflineGame({ players: pList, gameMode: 'local' }));
    setMatchStartTime(Date.now());
  };

  // Reset / Exit triggers
  const handleExitMatch = () => {
    soundManager.playClick();
    if (socket) socket.disconnect();
    dispatch(resetGame());
    setRewardsLog(null);
    dispatch(navigateTo('dashboard'));
  };

  const handleRestartOffline = () => {
    soundManager.playClick();
    dispatch(resetGame());
    setRewardsLog(null);
  };

  // Clipboard room code copying
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    soundManager.playClick();
    alert('Cyber room code copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* MODE SELECTION SCREEN */}
      {!gameMode && (
        <div className="max-w-4xl mx-auto text-center space-y-8 py-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold uppercase bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent neon-text-blue">
              Game Mode Operations
            </h2>
            <p className="text-sm text-gray-400">
              Select game mode settings to enter the Arena grid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Single player vs AI */}
            <div 
              onClick={startSinglePlayerSetup}
              className="glass-panel p-6 rounded-2xl border-cyan-500/10 cursor-pointer hover:border-cyan-500/30 shadow-sm hover:shadow-neonBlue transition-all duration-300 flex flex-col justify-between text-left h-64"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Cpu size={24} />
                </div>
                <h3 className="text-lg font-extrabold uppercase text-gray-100">Single Player</h3>
                <p className="text-xs text-gray-400 leading-normal">
                  Challenge our custom Mecha AI. Test strategies and practice climbs to earn XP rewards.
                </p>
              </div>
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-4">
                Launch Solo Mode ➔
              </span>
            </div>

            {/* Local Multiplayer */}
            <div 
              onClick={() => { soundManager.playClick(); dispatch(setGameMode('local_setup')); }}
              className="glass-panel p-6 rounded-2xl border-indigo-500/10 cursor-pointer hover:border-indigo-500/30 shadow-sm hover:shadow-neonPurple transition-all duration-300 flex flex-col justify-between text-left h-64"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-extrabold uppercase text-gray-100">Local Multi</h3>
                <p className="text-xs text-gray-400 leading-normal">
                  Gather 2 to 4 operators side-by-side. Compete on a single console and customize callsigns.
                </p>
              </div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-4">
                Configure Players ➔
              </span>
            </div>

            {/* Online Multiplayer */}
            <div 
              onClick={() => { soundManager.playClick(); dispatch(setGameMode('online')); }}
              className="glass-panel p-6 rounded-2xl border-purple-500/10 cursor-pointer hover:border-purple-500/30 shadow-sm hover:shadow-neonPurple transition-all duration-300 flex flex-col justify-between text-left h-64"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-extrabold uppercase text-gray-100">Online Arena</h3>
                <p className="text-xs text-gray-400 leading-normal">
                  Connect via WebSockets. Create custom room codes, invite friends, and text chat in real-time.
                </p>
              </div>
              <span className="text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-4">
                Establish Socket ➔
              </span>
            </div>

          </div>
        </div>
      )}

      {/* LOCAL MULTIPLAYER CONFIG SETUP */}
      {gameMode === 'local_setup' && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-2xl border-indigo-500/25 shadow-neonPurple text-left space-y-6">
          <h3 className="text-2xl font-black uppercase text-indigo-400 border-b border-slate-800 pb-2">
            Local Configuration Setup
          </h3>

          {/* Count select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Number of Operators</label>
            <div className="flex gap-4">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => { soundManager.playClick(); setPlayersCount(n); }}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    playersCount === n
                      ? 'bg-indigo-600 text-white shadow-neonPurple'
                      : 'bg-slate-900 border border-slate-800 text-gray-400 hover:bg-slate-850'
                  }`}
                >
                  {n} Players
                </button>
              ))}
            </div>
          </div>

          {/* Individual player input forms */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Player Callsigns</label>
            {Array.from({ length: playersCount }).map((_, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <span className="text-xs font-mono font-bold text-gray-500">P{idx + 1}</span>
                <input
                  type="text"
                  placeholder={`Callsign Player ${idx + 1}`}
                  value={localNames[idx]}
                  onChange={(e) => {
                    const next = [...localNames];
                    next[idx] = e.target.value;
                    setLocalNames(next);
                  }}
                  className="flex-1 bg-slate-950/70 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 outline-none focus:border-indigo-500/30"
                />
                <select
                  value={localTypes[idx]}
                  onChange={(e) => {
                    const nextTypes = [...localTypes];
                    nextTypes[idx] = e.target.value;
                    setLocalTypes(nextTypes);

                    const nextNames = [...localNames];
                    if (e.target.value === 'ai') {
                      nextNames[idx] = `Robot AI ${idx + 1}`;
                    } else {
                      nextNames[idx] = `Player ${idx + 1}`;
                    }
                    setLocalNames(nextNames);
                  }}
                  className="bg-slate-950 border border-slate-850 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 outline-none"
                >
                  <option value="human">👤 Human</option>
                  <option value="ai">🤖 Robot AI</option>
                </select>
                <select
                  value={localAvatars[idx]}
                  onChange={(e) => {
                    const next = [...localAvatars];
                    next[idx] = e.target.value;
                    setLocalAvatars(next);
                  }}
                  className="bg-slate-950 border border-slate-850 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 outline-none"
                >
                  {avatarsList.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-850">
            <button
              onClick={() => { soundManager.playClick(); dispatch(setGameMode(null)); }}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 text-gray-400 hover:bg-slate-900 font-bold uppercase tracking-wider text-xs transition-colors"
            >
              Abort Setup
            </button>
            <button
              onClick={startLocalSetup}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold shadow-neonBlue uppercase tracking-wider text-xs transition-transform duration-200"
            >
              Deploy Matches
            </button>
          </div>
        </div>
      )}

      {/* ONLINE LOBBY / CONNECTION SCREEN */}
      {gameMode === 'online' && !roomCode && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-2xl border-purple-500/25 shadow-neonPurple text-left space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-2xl font-black uppercase text-purple-400">
              Cyber Network Lobby
            </h3>
            <button
              onClick={handleExitMatch}
              className="text-xs text-rose-400 font-bold hover:underline"
            >
              Disconnect
            </button>
          </div>

          {!socketConnected ? (
            <div className="py-8 text-center space-y-4">
              <RefreshCw className="mx-auto text-purple-400 animate-spin" size={36} />
              <p className="text-xs text-gray-500 font-bold">Synchronizing sockets loop at port 5000...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {onlineError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  {onlineError}
                </div>
              )}

              {/* Create Room */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-850 bg-slate-900/10">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-purple-400">Create Custom Grid</h4>
                <div className="flex gap-3">
                  <select
                    value={maxPlayersOnline}
                    onChange={(e) => setMaxPlayersOnline(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 outline-none"
                  >
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                  </select>
                  <button
                    onClick={createOnlineRoom}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm shadow-neonPurple"
                  >
                    Deploy Cyber Room
                  </button>
                </div>
              </div>

              {/* Join Room */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-850 bg-slate-900/10">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-purple-400">Join Active Grid Room</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER 5-CHARACTER CODE"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength="5"
                    className="flex-1 bg-slate-950/70 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-200 text-center outline-none focus:border-cyan-500/30 uppercase"
                  />
                  <button
                    onClick={joinOnlineRoom}
                    className="px-6 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONLINE ROOM WAITING LOBBY (Lobby in room, not yet started) */}
      {gameMode === 'online' && roomCode && !isStarted && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-neonBlue text-left space-y-6">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-extrabold font-mono uppercase tracking-wide">
                Lobby Code
              </span>
              <span className="text-lg font-black font-mono text-white tracking-wide">{roomCode}</span>
              <button 
                onClick={copyRoomCode} 
                className="p-1 rounded text-cyan-400 hover:bg-slate-800"
                title="Copy Code"
              >
                <Copy size={12} />
              </button>
            </div>

            <button
              onClick={handleExitMatch}
              className="text-xs text-rose-400 font-bold hover:underline"
            >
              Abort Connection
            </button>
          </div>

          {onlineError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold">
              {onlineError}
            </div>
          )}

          {/* Lobby Players List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 pl-1">Syncing Player Slots ({players.length}/{maxPlayersOnline})</h4>
            <div className="space-y-2">
              {players.map((p) => {
                const isHost = p.socketId === hostId;
                const isMe = p.socketId === socket?.id;
                const av = avatarsList.find(a => a.id === p.avatar) || avatarsList[0];

                return (
                  <div key={p.socketId} className="flex justify-between items-center p-3 rounded-xl border border-slate-850 bg-slate-950/40">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center font-bold uppercase ${av.color}`}>
                        {p.username.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-200">
                          {p.username} {isMe ? '(You)' : ''}
                        </span>
                        {isHost && (
                          <span className="text-[9px] text-amber-500 font-extrabold uppercase">Lobby Host</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isHost ? (
                        <span className="text-xs font-mono text-emerald-400 font-bold">Ready</span>
                      ) : (
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          p.isReady ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-gray-500'
                        }`}>
                          {p.isReady ? 'Ready' : 'Not Ready'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lobby Chat */}
          <RoomChat 
            socket={socket} 
            roomCode={roomCode} 
            user={user} 
            chatList={chat} 
          />

          {/* Start Actions */}
          <div className="pt-4 border-t border-slate-850">
            {socket?.id === hostId ? (
              <button
                onClick={handleStartOnlineGame}
                disabled={players.length < 2 || !players.every(p => p.isReady)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold shadow-neonBlue disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider text-xs transition-transform"
              >
                Deploy Online Match
              </button>
            ) : (
              <button
                onClick={handleToggleReady}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-cyan-400 font-extrabold shadow-sm uppercase tracking-wider text-xs transition-all"
              >
                {players.find(p => p.socketId === socket?.id)?.isReady ? 'Cancel Ready' : 'Declare Ready'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* GAME PLAYING ARENA SCREEN (Active match layout) */}
      {isStarted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4">
          
          {/* Left / Top - Game Board (7 columns) */}
          <div className="lg:col-span-7 flex justify-center items-center">
            <GameBoard 
              players={animatedPlayers} 
              turnIndex={turnIndex} 
              triggerInfo={triggerInfo}
            />
          </div>

          {/* Right / Bottom - HUD & Control Dice (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Control card containing the 3D Dice and exit button */}
            <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 text-center flex flex-col items-center gap-6 justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 z-30 flex gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowRules(true);
                  }}
                  className="px-2 py-1 rounded bg-cyan-955/40 border border-cyan-800/40 text-[9px] font-black text-cyan-400 hover:bg-cyan-900 hover:text-white transition-colors uppercase tracking-wider"
                  title="How to Play Guide"
                >
                  Guidebook
                </button>
                <button
                  onClick={() => {
                    if (confirm('Leave and forfeit the current match?')) {
                      handleExitMatch();
                    }
                  }}
                  className="p-1 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-900 hover:text-white transition-colors"
                  title="Forfeit Match"
                >
                  <LogOut size={12} />
                </button>
              </div>

              <div className="text-left w-full border-b border-slate-850 pb-2">
                <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider">Operational Mode: {gameMode}</span>
              </div>

              {/* 3D Dice controller */}
              <div className="py-2">
                <Dice3D
                  result={diceResult}
                  isRolling={isRolling}
                  onClick={gameMode === 'online' ? handleOnlineRoll : handleOfflineRoll}
                  disabled={
                    isRolling || 
                    winner || 
                    (gameMode === 'single' && players[turnIndex]?.isAI) ||
                    (gameMode === 'online' && players[turnIndex]?.socketId !== socket?.id)
                  }
                />
              </div>

              {gameMode === 'single' && players[turnIndex]?.isAI && (
                <div className="text-xs text-indigo-400 font-bold animate-pulse">
                  AI calculation sequence active...
                </div>
              )}
            </div>

            {/* General HUD */}
            <GameHUD
              players={players}
              turnIndex={turnIndex}
              diceHistory={diceHistory}
              triggerInfo={triggerInfo}
            />

            {/* Live Chat inside online games */}
            {gameMode === 'online' && (
              <RoomChat 
                socket={socket} 
                roomCode={roomCode} 
                user={user} 
                chatList={chat} 
              />
            )}
          </div>

        </div>
      )}

      {/* POST GAME MATCH SUMMARY OVERLAY MODAL */}
      {winner && (
        <MatchSummary
          winner={winner}
          rankings={
            gameMode === 'online'
              ? [...players].sort((a, b) => b.position - a.position).map((p, idx) => ({ ...p, rank: idx + 1 }))
              : [...players].sort((a, b) => b.position - a.position).map((p, idx) => ({ ...p, rank: idx + 1 }))
          }
          rewards={rewardsLog}
          onPlayAgain={gameMode !== 'online' ? handleRestartOffline : null}
          onExit={handleExitMatch}
        />
      )}
      
      {/* GUIDEBOOK RULES MODAL */}
      {showRules && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full bg-[#2D1D13] border border-[#8C6D4C] rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#5C4033] pb-4 mb-4">
              <h3 className="text-xl font-bold font-serif text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                📖 Classic Board Guidebook
              </h3>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowRules(false);
                }}
                className="text-[#FAF5EB] hover:text-[#D4AF37] font-bold text-xs uppercase px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 transition-colors"
              >
                Close [X]
              </button>
            </div>

            <div className="space-y-5 text-left text-sm text-gray-200">
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-[#8C6D4C]/30 space-y-1">
                <h4 className="font-bold text-[#D4AF37] uppercase text-xs tracking-wider">🎯 Main Objective</h4>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  Be the first traveler to navigate your wooden token to **Cell 100** at the top-left of the board! All players start at **Cell 1** (bottom-left).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-yellow-800/40 bg-yellow-950/10 space-y-1">
                  <h4 className="font-bold text-[#D4AF37] uppercase text-xs tracking-wider flex items-center gap-1.5">
                    🪜 Golden Ladders (Climb Up!)
                  </h4>
                  <p className="text-[10px] leading-relaxed text-gray-400">
                    Land on the bottom of a golden ladder to climb up immediately. Excellent for shortcutting your way to cell 100!
                  </p>
                </div>
                
                <div className="p-3.5 rounded-xl border border-red-800/40 bg-red-950/10 space-y-1">
                  <h4 className="font-bold text-[#8C2B2B] uppercase text-xs tracking-wider flex items-center gap-1.5">
                    🐍 Python Serpents (Watch Out!)
                  </h4>
                  <p className="text-[10px] leading-relaxed text-gray-400">
                    Landing on the head of a scaled serpent will slide your token all the way down to its tail. Stay alert traveler!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#D4AF37] uppercase text-xs tracking-wider">⚡ Special Board Squares</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-stone-900/50 border border-stone-850">
                    <span className="text-base shrink-0">❄️</span>
                    <div>
                      <h5 className="text-xs font-bold text-[#C5A059]">Sticky Quicksand Trap (Cell 15 & 55)</h5>
                      <p className="text-[10px] text-gray-450">Forces your next turn to be skipped (stuck in sticky sand).</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-stone-900/50 border border-stone-850">
                    <span className="text-base shrink-0">💥</span>
                    <div>
                      <h5 className="text-xs font-bold text-[#8C2B2B]">Pitfall Spike Trap (Cell 38 & 79)</h5>
                      <p className="text-[10px] text-gray-450">Triggers spikes and blows your token backward 3 cells instantly.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-stone-900/50 border border-stone-850">
                    <span className="text-base shrink-0">🛡️</span>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-650">Protection Charm (Cell 8 & 45)</h5>
                      <p className="text-[10px] text-gray-455">Equips a magical protective shield that consumes itself to block the next snake bite.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-stone-900/50 border border-stone-850">
                    <span className="text-base shrink-0">🚀</span>
                    <div>
                      <h5 className="text-xs font-bold text-[#D4AF37]">Pegasus Boots Speed Booster (Cell 22 & 67)</h5>
                      <p className="text-[10px] text-gray-455">Launches your wooden token 4 cells forward instantly.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-stone-900/50 border border-stone-850">
                    <span className="text-base shrink-0">⏳</span>
                    <div>
                      <h5 className="text-xs font-bold text-[#8C6D4C]">Time Hourglass Booster (Cell 35 & 80)</h5>
                      <p className="text-[10px] text-gray-455">Overturns time to grant you an immediate free extra turn.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 text-center font-bold text-[11px] border border-stone-850">
                👉 Click the carved <span className="text-[#D4AF37]">3D DICE</span> or press the large <span className="text-[#8C2B2B]">ROLL</span> button when it's your turn!
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlayPage;
