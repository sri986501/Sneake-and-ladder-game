const User = require('../models/User');

// @desc    Update user profile (username, avatar)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (username && username.trim() !== user.username) {
      // Check if username taken
      const nameExists = await User.findOne({ username: username.trim() });
      if (nameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      user.username = username.trim();
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        totalPoints: user.totalPoints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users for adding friends
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude self
    })
      .select('username avatar level totalPoints')
      .limit(10);

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add friend
// @route   POST /api/users/friends/:id
// @access  Private
exports.addFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    if (friendId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself' });
    }

    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    user.friends.push(friendId);
    await user.save();

    // Optionally add reverse friendship
    if (!friend.friends.includes(req.user.id)) {
      friend.friends.push(req.user.id);
      await friend.save();
    }

    res.status(200).json({ success: true, message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove friend
// @route   DELETE /api/users/friends/:id
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.friends = user.friends.filter(fId => fId.toString() !== friendId);
    await user.save();

    if (friend) {
      friend.friends = friend.friends.filter(fId => fId.toString() !== req.user.id.toString());
      await friend.save();
    }

    res.status(200).json({ success: true, message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Claim daily reward
// @route   POST /api/users/daily-reward
// @access  Private
exports.claimDailyReward = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (user.lastDailyRewardClaimed && (now - user.lastDailyRewardClaimed) < oneDay) {
      const remainingTime = oneDay - (now - user.lastDailyRewardClaimed);
      const hours = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
      return res.status(400).json({
        success: false,
        message: `Daily reward already claimed. Try again in ${hours}h ${minutes}m.`
      });
    }

    // Award rewards
    const xpReward = 150;
    const pointsReward = 50;

    user.totalPoints += pointsReward;
    user.weeklyPoints += pointsReward;
    user.monthlyPoints += pointsReward;
    user.xp += xpReward;
    user.lastDailyRewardClaimed = now;

    // Check level up
    let levelUps = 0;
    let xpNeeded = user.level * 300;
    while (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.level += 1;
      levelUps++;
      xpNeeded = user.level * 300;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Daily reward claimed! Received +${pointsReward} Points & +${xpReward} XP.`,
      data: {
        totalPoints: user.totalPoints,
        level: user.level,
        xp: user.xp,
        xpNeeded,
        levelUps
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user stats dashboard info
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const xpNeeded = user.level * 300;
    const winRate = user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        losses: user.losses,
        winRate,
        totalPoints: user.totalPoints,
        level: user.level,
        xp: user.xp,
        xpNeeded,
        bestStreak: user.bestStreak,
        currentStreak: user.currentStreak,
        highestDiceRollCount: user.highestDiceRollCount,
        ladderClimbs: user.ladderClimbs,
        snakeEscapes: user.snakeEscapes,
        achievementsCount: user.achievements.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
