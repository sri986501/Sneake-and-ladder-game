const User = require('../models/User');

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const category = req.query.category || 'alltime'; // 'daily', 'weekly', 'monthly', 'alltime'
    let sortQuery = {};

    switch (category) {
      case 'daily':
        // proxy daily activity using wins
        sortQuery = { wins: -1, totalPoints: -1 };
        break;
      case 'weekly':
        sortQuery = { weeklyPoints: -1, totalPoints: -1 };
        break;
      case 'monthly':
        sortQuery = { monthlyPoints: -1, totalPoints: -1 };
        break;
      case 'alltime':
      default:
        sortQuery = { totalPoints: -1 };
        break;
    }

    const users = await User.find({})
      .select('username avatar level totalPoints weeklyPoints monthlyPoints gamesPlayed wins losses')
      .sort(sortQuery)
      .limit(50);

    const rankings = users.map((u, index) => {
      const winRate = u.gamesPlayed > 0 ? Math.round((u.wins / u.gamesPlayed) * 100) : 0;
      let score = u.totalPoints;

      if (category === 'weekly') score = u.weeklyPoints;
      else if (category === 'monthly') score = u.monthlyPoints;
      else if (category === 'daily') score = u.wins * 10; // represent daily wins as points score proxy

      return {
        rank: index + 1,
        userId: u._id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        points: score,
        gamesPlayed: u.gamesPlayed,
        wins: u.wins,
        winRate,
        trophies: Math.floor(u.wins / 3) // Give them trophies based on wins
      };
    });

    res.status(200).json({
      success: true,
      category,
      data: rankings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
