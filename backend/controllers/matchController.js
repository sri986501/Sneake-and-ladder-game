const Match = require('../models/Match');
const User = require('../models/User');

// Helper to check and award achievements
const checkAchievements = async (user) => {
  const achievementsList = [
    { id: 'first_victory', title: 'First Victory', desc: 'Win your first match', points: 50, check: u => u.wins >= 1 },
    { id: 'snake_survivor', title: 'Snake Survivor', desc: 'Escape snakes 10 times', points: 100, check: u => u.snakeEscapes >= 10 },
    { id: 'ladder_master', title: 'Ladder Master', desc: 'Climb 15 ladders', points: 100, check: u => u.ladderClimbs >= 15 },
    { id: 'games_100', title: 'Centurion', desc: 'Play 100 matches', points: 150, check: u => u.gamesPlayed >= 100 },
    { id: 'win_streak_10', title: 'Unstoppable', desc: 'Achieve a 10 win streak', points: 200, check: u => u.bestStreak >= 10 },
    { id: 'champion', title: 'Arena Champion', desc: 'Win 10 matches', points: 150, check: u => u.wins >= 10 },
    { id: 'legend', title: 'Legendary Climber', desc: 'Win 50 matches', points: 300, check: u => u.wins >= 50 },
    { id: 'grand_master', title: 'Grand Master', desc: 'Win 100 matches', points: 500, check: u => u.wins >= 100 }
  ];

  const newlyUnlocked = [];
  const currentUnlockedIds = user.achievements.map(a => a.achievementId);

  for (const ach of achievementsList) {
    if (!currentUnlockedIds.includes(ach.id) && ach.check(user)) {
      user.achievements.push({ achievementId: ach.id, unlockedAt: new Date() });
      user.totalPoints += ach.points;
      user.weeklyPoints += ach.points;
      user.monthlyPoints += ach.points;
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
};

// @desc    Log match result
// @route   POST /api/matches
// @access  Private (or Public for guests but handles logged in user state)
exports.logMatch = async (req, res) => {
  try {
    const { matchMode, players, winner, duration, moves } = req.body;

    if (!matchMode || !players || !winner) {
      return res.status(400).json({ success: false, message: 'Invalid match logging data' });
    }

    // Save match log
    const match = await Match.create({
      matchMode,
      players,
      winner,
      duration,
      moves
    });

    const playerRewardDetails = [];

    // Update stats for logged in players
    for (const p of players) {
      if (p.userId) {
        const user = await User.findById(p.userId);
        if (user) {
          // Increment games played
          user.gamesPlayed += 1;
          const isWinner = p.userId.toString() === winner.userId?.toString();

          let pointsEarned = 10; // Participation points
          let xpEarned = 30;

          if (isWinner) {
            user.wins += 1;
            user.currentStreak += 1;
            if (user.currentStreak > user.bestStreak) {
              user.bestStreak = user.currentStreak;
            }
            pointsEarned = 100;
            xpEarned = 200;
          } else {
            user.losses += 1;
            user.currentStreak = 0; // Reset streak

            // Assign points based on rank
            if (p.rank === 2) {
              pointsEarned = 50;
              xpEarned = 100;
            } else if (p.rank === 3) {
              pointsEarned = 25;
              xpEarned = 50;
            }
          }

          // Accumulate points and XP
          user.totalPoints += pointsEarned;
          user.weeklyPoints += pointsEarned;
          user.monthlyPoints += pointsEarned;
          user.xp += xpEarned;

          // Check custom gameplay stats passed from client
          if (p.ladderClimbs) user.ladderClimbs += p.ladderClimbs;
          if (p.snakeEscapes) user.snakeEscapes += p.snakeEscapes;
          if (p.rollsCount && p.rollsCount > user.highestDiceRollCount) {
            user.highestDiceRollCount = p.rollsCount;
          }

          // Level up logic
          let levelUps = 0;
          let xpNeeded = user.level * 300;
          while (user.xp >= xpNeeded) {
            user.xp -= xpNeeded;
            user.level += 1;
            levelUps++;
            xpNeeded = user.level * 300;
          }

          // Check achievements
          const unlocked = await checkAchievements(user);

          await user.save();

          playerRewardDetails.push({
            userId: user._id,
            username: user.username,
            pointsEarned,
            xpEarned,
            levelUps,
            newLevel: user.level,
            unlockedAchievements: unlocked
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: match,
      rewards: playerRewardDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user matches history
// @route   GET /api/matches/my
// @access  Private
exports.getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      'players.userId': req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
