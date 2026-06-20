const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  achievementId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rewardPoints: {
    type: Number,
    default: 50
  },
  badgeIcon: {
    type: String,
    required: true // Name of the icon identifier (e.g. Trophy, Zap, Flame)
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);
