import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameMode: null, // 'single' | 'local' | 'online' | null
  roomCode: null,
  players: [],
  turnIndex: 0,
  isStarted: false,
  winner: null,
  diceResult: null,
  isRolling: false,
  chat: [],
  diceHistory: [],
  gotExtraTurn: false,
  triggerInfo: null, // { type: 'snake' | 'ladder', from: number, to: number }
  hostId: null,
  socketConnected: false,
  currentPage: 'landing' // 'landing' | 'login' | 'register' | 'dashboard' | 'play' | 'leaderboard' | 'achievements' | 'history' | 'settings' | 'admin'
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    navigateTo: (state, action) => {
      state.currentPage = action.payload;
    },
    setGameMode: (state, action) => {
      state.gameMode = action.payload;
    },
    setRoomCode: (state, action) => {
      state.roomCode = action.payload;
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    setRoomData: (state, action) => {
      const room = action.payload;
      state.roomCode = room.code;
      state.players = room.players;
      state.isStarted = room.isStarted;
      state.turnIndex = room.turnIndex;
      state.winner = room.winner;
      state.hostId = room.hostId;
      state.chat = room.chat || [];
      state.diceHistory = room.diceHistory || [];
    },
    updateRoomPlayers: (state, action) => {
      state.players = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chat.push(action.payload);
      if (state.chat.length > 50) state.chat.shift();
    },
    // Start local or single-player game
    startOfflineGame: (state, action) => {
      state.players = action.payload.players;
      state.gameMode = action.payload.gameMode;
      state.isStarted = true;
      state.turnIndex = 0;
      state.winner = null;
      state.diceResult = null;
      state.isRolling = false;
      state.diceHistory = [];
      state.gotExtraTurn = false;
      state.triggerInfo = null;
    },
    setRolling: (state, action) => {
      state.isRolling = action.payload;
    },
    startRoll: (state, action) => {
      state.isRolling = true;
      state.diceResult = action.payload;
    },
    applyDiceRoll: (state, action) => {
      const { rollVal, prevPosition, intermediatePosition, finalPosition, triggerType, gotExtraTurn, nextTurnIndex } = action.payload;
      
      state.diceResult = rollVal;
      state.isRolling = false;
      state.gotExtraTurn = gotExtraTurn;

      const activePlayer = state.players[state.turnIndex];
      if (activePlayer) {
        activePlayer.rollsCount = (activePlayer.rollsCount || 0) + 1;
        activePlayer.position = finalPosition;
        
        if (triggerType === 'snake') {
          activePlayer.snakeEscapes = (activePlayer.snakeEscapes || 0) + 1;
          state.triggerInfo = { type: 'snake', from: intermediatePosition, to: finalPosition };
        } else if (triggerType === 'ladder') {
          activePlayer.ladderClimbs = (activePlayer.ladderClimbs || 0) + 1;
          state.triggerInfo = { type: 'ladder', from: intermediatePosition, to: finalPosition };
        } else if (triggerType === 'shield_block') {
          activePlayer.hasShield = false; // consume shield
          state.triggerInfo = { type: 'shield_block', from: intermediatePosition, to: finalPosition };
          state.chat.push({
            sender: 'SYSTEM',
            message: `${activePlayer.username} used Nanoshield to block a Snake Bite!`,
            timestamp: Date.now()
          });
        } else if (triggerType === 'freeze') {
          activePlayer.isFrozen = true;
          state.triggerInfo = { type: 'freeze', from: intermediatePosition, to: finalPosition };
          state.chat.push({
            sender: 'SYSTEM',
            message: `${activePlayer.username} stepped on an EMP Freeze trap! Next turn skipped.`,
            timestamp: Date.now()
          });
        } else if (triggerType === 'mine') {
          state.triggerInfo = { type: 'mine', from: intermediatePosition, to: finalPosition };
          state.chat.push({
            sender: 'SYSTEM',
            message: `${activePlayer.username} triggered a Gravity Mine and was blown back 3 cells!`,
            timestamp: Date.now()
          });
        } else if (triggerType === 'shield') {
          activePlayer.hasShield = true;
          state.triggerInfo = { type: 'shield', from: intermediatePosition, to: finalPosition };
          state.chat.push({
            sender: 'SYSTEM',
            message: `${activePlayer.username} acquired a Nanoshield!`,
            timestamp: Date.now()
          });
        } else if (triggerType === 'speed') {
          state.triggerInfo = { type: 'speed', from: intermediatePosition, to: finalPosition };
          state.chat.push({
            sender: 'SYSTEM',
            message: `${activePlayer.username} hit a Hyperdrive speed booster and zoomed forward 4 cells!`,
            timestamp: Date.now()
          });
        } else if (triggerType === 'double') {
          state.triggerInfo = { type: 'double', from: intermediatePosition, to: finalPosition };
          state.gotExtraTurn = true;
          state.chat.push({
            sender: 'SYSTEM',
            message: `${activePlayer.username} overclocked their turn and got a free extra roll!`,
            timestamp: Date.now()
          });
        } else {
          state.triggerInfo = null;
        }

        // Add to roll history
        state.diceHistory.push({
          player: activePlayer.username,
          roll: rollVal,
          prev: prevPosition,
          current: finalPosition
        });
        if (state.diceHistory.length > 15) state.diceHistory.shift();

        // Check winner
        if (finalPosition === 100) {
          state.winner = activePlayer;
        }
      }

      // Update turn index if no winner and didn't get extra turn
      if (!state.winner && !gotExtraTurn) {
        let targetTurn = nextTurnIndex;
        let attempts = 0;
        while (state.players[targetTurn]?.isFrozen && attempts < state.players.length) {
          state.players[targetTurn].isFrozen = false; // thaw player
          state.chat.push({
            sender: 'SYSTEM',
            message: `${state.players[targetTurn].username}'s turn was skipped due to EMP Freeze!`,
            timestamp: Date.now()
          });
          targetTurn = (targetTurn + 1) % state.players.length;
          attempts++;
        }
        state.turnIndex = targetTurn;
      }
    },
    clearTriggerInfo: (state) => {
      state.triggerInfo = null;
    },
    resetGame: (state) => {
      state.gameMode = null;
      state.roomCode = null;
      state.players = [];
      state.turnIndex = 0;
      state.isStarted = false;
      state.winner = null;
      state.diceResult = null;
      state.isRolling = false;
      state.diceHistory = [];
      state.gotExtraTurn = false;
      state.triggerInfo = null;
      state.hostId = null;
    }
  }
});

export const {
  navigateTo,
  setGameMode,
  setRoomCode,
  setSocketConnected,
  setRoomData,
  updateRoomPlayers,
  addChatMessage,
  startOfflineGame,
  setRolling,
  startRoll,
  applyDiceRoll,
  clearTriggerInfo,
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;
