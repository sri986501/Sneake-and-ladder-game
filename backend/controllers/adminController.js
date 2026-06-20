const User = require('../models/User');
const Match = require('../models/Match');
const Achievement = require('../models/Achievement');

// @desc    Get all users (admin-only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('username email role level totalPoints gamesPlayed wins losses createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user (admin-only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    const userObj = await User.findById(userId);
    if (!userObj) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'Player account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset leaderboard scores (admin-only)
// @route   POST /api/admin/reset-leaderboard
// @access  Private/Admin
exports.resetLeaderboard = async (req, res) => {
  try {
    const { type } = req.body; // 'weekly', 'monthly', 'alltime'

    let update = {};
    if (type === 'weekly') {
      update = { weeklyPoints: 0 };
    } else if (type === 'monthly') {
      update = { monthlyPoints: 0 };
    } else if (type === 'alltime') {
      update = { totalPoints: 0, weeklyPoints: 0, monthlyPoints: 0, wins: 0, losses: 0, gamesPlayed: 0 };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid reset type. Use weekly, monthly, or alltime' });
    }

    await User.updateMany({}, { $set: update });

    res.status(200).json({ success: true, message: `Leaderboard resetting for category '${type}' completed` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get match logs (admin-only)
// @route   GET /api/admin/matches
// @access  Private/Admin
exports.getMatchLogs = async (req, res) => {
  try {
    const matches = await Match.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
