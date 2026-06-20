const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchMode: {
    type: String,
    enum: ['single', 'local', 'online'],
    required: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Can be null for guest/AI players
    },
    username: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: 'avatar1'
    },
    score: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      required: true
    }
  }],
  winner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    username: {
      type: String,
      required: true
    }
  },
  moves: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);
