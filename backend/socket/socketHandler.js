const SNAKES = {
  99: 54,
  87: 24,
  72: 41,
  68: 18,
  62: 19,
  49: 11
};

const LADDERS = {
  4: 25,
  13: 46,
  33: 69,
  42: 63,
  50: 91
};

const TRAPS = {
  15: { type: 'freeze' },
  55: { type: 'freeze' },
  38: { type: 'mine' },
  79: { type: 'mine' }
};

const BOOSTERS = {
  8: { type: 'shield' },
  45: { type: 'shield' },
  22: { type: 'speed' },
  67: { type: 'speed' },
  35: { type: 'double' },
  80: { type: 'double' }
};


// In-memory rooms repository
const rooms = {};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create custom game room
    socket.on('create_room', (data) => {
      try {
        const { maxPlayers, user } = data;
        const code = generateRoomCode();

        rooms[code] = {
          code,
          maxPlayers: parseInt(maxPlayers) || 4,
          hostId: socket.id,
          players: [
            {
              socketId: socket.id,
              userId: user?._id || null,
              username: user?.username || `Player_${socket.id.slice(0, 4)}`,
              avatar: user?.avatar || 'avatar1',
              position: 1,
              rollsCount: 0,
              ladderClimbs: 0,
              snakeEscapes: 0,
              isReady: true // Host is always ready
            }
          ],
          isStarted: false,
          turnIndex: 0,
          diceHistory: [],
          winner: null,
          chat: []
        };

        socket.join(code);
        console.log(`Room created: ${code} by ${socket.id}`);

        socket.emit('room_created', {
          roomCode: code,
          room: rooms[code]
        });
      } catch (err) {
        console.error(err);
        socket.emit('error_message', 'Failed to create room.');
      }
    });

    // Join room
    socket.on('join_room', (data) => {
      try {
        const { roomCode, user } = data;
        const code = roomCode ? roomCode.toUpperCase().trim() : '';
        const room = rooms[code];

        if (!room) {
          return socket.emit('error_message', 'Room not found. Please check the code.');
        }

        if (room.isStarted) {
          return socket.emit('error_message', 'Game has already started in this room.');
        }

        if (room.players.length >= room.maxPlayers) {
          return socket.emit('error_message', 'Room is full.');
        }

        // Avoid duplicate additions
        const alreadyInRoom = room.players.find(p => p.socketId === socket.id);
        if (!alreadyInRoom) {
          room.players.push({
            socketId: socket.id,
            userId: user?._id || null,
            username: user?.username || `Player_${socket.id.slice(0, 4)}`,
            avatar: user?.avatar || 'avatar2',
            position: 1,
            rollsCount: 0,
            ladderClimbs: 0,
            snakeEscapes: 0,
            isReady: false
          });
        }

        socket.join(code);
        console.log(`Player joined room: ${code}`);

        io.to(code).emit('room_update', room);
      } catch (err) {
        console.error(err);
        socket.emit('error_message', 'Failed to join room.');
      }
    });

    // Player Ready toggle
    socket.on('toggle_ready', (data) => {
      const { roomCode } = data;
      const room = rooms[roomCode];
      if (room) {
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          player.isReady = !player.isReady;
          io.to(roomCode).emit('room_update', room);
        }
      }
    });

    // Send chat message
    socket.on('send_message', (data) => {
      const { roomCode, message, username } = data;
      const room = rooms[roomCode];
      if (room) {
        const chatItem = {
          sender: username || 'System',
          message: message,
          timestamp: new Date()
        };
        room.chat.push(chatItem);
        // limit log size
        if (room.chat.length > 50) room.chat.shift();

        io.to(roomCode).emit('receive_message', chatItem);
      }
    });

    // Start Game
    socket.on('start_game', (data) => {
      const { roomCode } = data;
      const room = rooms[roomCode];
      if (!room) return;

      if (room.hostId !== socket.id) {
        return socket.emit('error_message', 'Only the host can start the game.');
      }

      // Check if all players are ready
      const allReady = room.players.every(p => p.isReady);
      if (!allReady) {
        return socket.emit('error_message', 'Wait until all players are ready.');
      }

      room.isStarted = true;
      room.turnIndex = 0;
      room.winner = null;

      // Randomize turn order
      room.players = room.players.sort(() => Math.random() - 0.5);

      io.to(roomCode).emit('game_started', room);
    });

    // Roll Dice
    socket.on('roll_dice', (data) => {
      const { roomCode } = data;
      const room = rooms[roomCode];
      if (!room || !room.isStarted || room.winner) return;

      const activePlayer = room.players[room.turnIndex];
      if (activePlayer.socketId !== socket.id) {
        return socket.emit('error_message', 'It is not your turn.');
      }

      // Generate roll value 1-6
      const rollVal = Math.floor(Math.random() * 6) + 1;
      activePlayer.rollsCount += 1;

      const prevPosition = activePlayer.position;
      let nextPosition = prevPosition + rollVal;

      let triggerType = null;
      let landingPos = nextPosition;

      // Bound to max 100
      if (nextPosition > 100) {
        nextPosition = prevPosition;
        activePlayer.position = prevPosition;
      } else if (nextPosition === 100) {
        activePlayer.position = 100;
        room.winner = activePlayer;
      } else {
        if (SNAKES[nextPosition]) {
          if (activePlayer.hasShield) {
            landingPos = nextPosition;
            triggerType = 'shield_block';
            activePlayer.hasShield = false;
          } else {
            landingPos = SNAKES[nextPosition];
            triggerType = 'snake';
            activePlayer.snakeEscapes += 1;
          }
          activePlayer.position = landingPos;
        } else if (LADDERS[nextPosition]) {
          landingPos = LADDERS[nextPosition];
          triggerType = 'ladder';
          activePlayer.ladderClimbs += 1;
          activePlayer.position = landingPos;
        } else if (TRAPS[nextPosition]) {
          const trap = TRAPS[nextPosition];
          triggerType = trap.type;
          if (trap.type === 'mine') {
            landingPos = Math.max(1, nextPosition - 3);
          } else {
            landingPos = nextPosition;
            activePlayer.isFrozen = true;
          }
          activePlayer.position = landingPos;
        } else if (BOOSTERS[nextPosition]) {
          const booster = BOOSTERS[nextPosition];
          triggerType = booster.type;
          if (booster.type === 'speed') {
            landingPos = Math.min(100, nextPosition + 4);
          } else if (booster.type === 'shield') {
            landingPos = nextPosition;
            activePlayer.hasShield = true;
          } else {
            landingPos = nextPosition;
          }
          activePlayer.position = landingPos;
        } else {
          activePlayer.position = nextPosition;
        }
      }

      // Record roll in history
      room.diceHistory.push({
        player: activePlayer.username,
        roll: rollVal,
        prev: prevPosition,
        current: activePlayer.position
      });
      if (room.diceHistory.length > 15) room.diceHistory.shift();

      // Check if roll was a 6 or landed on double roll (grants extra turn)
      let gotExtraTurn = false;
      if ((rollVal === 6 || triggerType === 'double') && !room.winner) {
        gotExtraTurn = true;
      } else if (!room.winner) {
        // Next player turn, skip frozen players
        let targetIndex = (room.turnIndex + 1) % room.players.length;
        let attempts = 0;
        while (room.players[targetIndex] && room.players[targetIndex].isFrozen && attempts < room.players.length) {
          room.players[targetIndex].isFrozen = false; // thaw
          const chatItem = {
            sender: 'System',
            message: `${room.players[targetIndex].username}'s turn was skipped due to EMP Freeze!`,
            timestamp: new Date()
          };
          room.chat.push(chatItem);
          targetIndex = (targetIndex + 1) % room.players.length;
          attempts++;
        }
        room.turnIndex = targetIndex;
      }

      // Broadcast dice rolled event
      io.to(roomCode).emit('dice_rolled', {
        player: activePlayer,
        rollVal,
        prevPosition,
        intermediatePosition: nextPosition,
        finalPosition: activePlayer.position,
        triggerType,
        gotExtraTurn,
        turnIndex: room.turnIndex,
        room
      });

      // Handle game ended
      if (room.winner) {
        // Calculate rankings
        const finalRankings = room.players
          .map(p => ({ ...p }))
          .sort((a, b) => b.position - a.position);

        finalRankings.forEach((p, idx) => {
          p.rank = idx + 1;
        });

        io.to(roomCode).emit('game_ended', {
          winner: room.winner,
          rankings: finalRankings,
          room
        });
      }
    });

    // Leave Room explicitly
    socket.on('leave_room', (data) => {
      const { roomCode } = data;
      handlePlayerDeparture(socket, roomCode);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Find room(s) that this socket was in
      Object.keys(rooms).forEach((code) => {
        const room = rooms[code];
        const isPlayerInRoom = room.players.some(p => p.socketId === socket.id);
        if (isPlayerInRoom) {
          handlePlayerDeparture(socket, code);
        }
      });
    });
  });

  // Handle player leaving or disconnecting
  const handlePlayerDeparture = (socket, roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Filter out the player
    room.players = room.players.filter(p => p.socketId !== socket.id);
    socket.leave(roomCode);

    console.log(`Socket ${socket.id} left room ${roomCode}`);

    if (room.players.length === 0) {
      // Delete room if empty
      delete rooms[roomCode];
      console.log(`Room ${roomCode} deleted as it became empty`);
    } else {
      // Handle host leaving
      if (room.hostId === socket.id) {
        room.hostId = room.players[0].socketId; // Assign new host
        const systemMsg = {
          sender: 'System',
          message: `${room.players[0].username} is now the host.`,
          timestamp: new Date()
        };
        room.chat.push(systemMsg);
        io.to(roomCode).emit('receive_message', systemMsg);
      }

      // Handle game in progress leaving
      if (room.isStarted && !room.winner) {
        // If only 1 player remains, they win by default
        if (room.players.length === 1) {
          room.winner = room.players[0];
          const rankings = [{ ...room.winner, rank: 1 }];

          io.to(roomCode).emit('game_ended', {
            winner: room.winner,
            rankings,
            aborted: true,
            message: 'All other players disconnected. You win by default!'
          });
          return;
        }

        // Update turn index to avoid boundaries overflow
        room.turnIndex = room.turnIndex % room.players.length;
      }

      io.to(roomCode).emit('room_update', room);
    }
  };
};
