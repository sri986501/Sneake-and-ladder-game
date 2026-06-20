const Tournament = require('../models/Tournament');
const User = require('../models/User');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Private
exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tournaments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a tournament
// @route   POST /api/tournaments
// @access  Private
exports.createTournament = async (req, res) => {
  try {
    const { title, description, entryFee, maxPlayers } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Tournament title is required' });
    }

    const tournament = await Tournament.create({
      title,
      description,
      entryFee: entryFee || 0,
      maxPlayers: maxPlayers || 16,
      creator: req.user ? req.user.id : null,
      prizePool: entryFee || 0, // Initial prize pool matches entry fee
      status: 'upcoming'
    });

    res.status(201).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a tournament
// @route   POST /api/tournaments/:id/join
// @access  Private
exports.joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Tournament has already started or completed' });
    }

    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(400).json({ success: false, message: 'Tournament is full' });
    }

    // Check if already joined
    const alreadyJoined = tournament.participants.some(
      p => p.user && p.user.toString() === req.user.id
    );

    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'You have already joined this tournament' });
    }

    // Deduct entry fee if any
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (tournament.entryFee > 0) {
      if (user.totalPoints < tournament.entryFee) {
        return res.status(400).json({
          success: false,
          message: `Insufficient points. You need ${tournament.entryFee} points, but only have ${user.totalPoints}.`
        });
      }
      user.totalPoints -= tournament.entryFee;
      await user.save();
      tournament.prizePool += tournament.entryFee;
    }

    tournament.participants.push({
      user: user._id,
      username: user.username,
      avatar: user.avatar,
      points: 0,
      wins: 0,
      matchesPlayed: 0
    });

    await tournament.save();
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Contribute to tournament prize pool
// @route   POST /api/tournaments/:id/contribute
// @access  Private
exports.contributePrize = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Contribution amount must be greater than zero' });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Tournament is already completed' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.totalPoints < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You want to contribute ${amount} points, but only have ${user.totalPoints}.`
      });
    }

    // Deduct from user
    user.totalPoints -= amount;
    await user.save();

    // Add to prize pool
    tournament.prizePool += amount;
    await tournament.save();

    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start/Conduct tournament
// @route   POST /api/tournaments/:id/start
// @access  Private
exports.startTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Tournament is already started or completed' });
    }

    if (tournament.participants.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 participants are required to start a tournament' });
    }

    tournament.status = 'active';
    await tournament.save();

    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit tournament match result
// @route   POST /api/tournaments/:id/submit-match
// @access  Private
exports.submitMatchResult = async (req, res) => {
  try {
    const { winnerUserId, participantUserIds } = req.body;
    if (!winnerUserId || !participantUserIds || participantUserIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Winner and participant user IDs are required' });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Tournament is not active' });
    }

    // Update participants' wins, points, matchesPlayed
    for (const pId of participantUserIds) {
      const participant = tournament.participants.find(
        p => p.user && p.user.toString() === pId.toString()
      );
      if (participant) {
        participant.matchesPlayed += 1;
        if (pId.toString() === winnerUserId.toString()) {
          participant.wins += 1;
          participant.points += 3; // +3 points for win
        } else {
          participant.points += 1; // +1 point for participation
        }
      }
    }

    await tournament.save();
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete tournament
// @route   POST /api/tournaments/:id/complete
// @access  Private
exports.completeTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Tournament is not active' });
    }

    if (tournament.participants.length === 0) {
      return res.status(400).json({ success: false, message: 'No participants in this tournament' });
    }

    // Determine the winner (the one with the highest tournament points)
    const sorted = [...tournament.participants].sort((a, b) => b.points - a.points);
    const winnerParticipant = sorted[0];

    tournament.status = 'completed';
    tournament.winner = {
      user: winnerParticipant.user,
      username: winnerParticipant.username
    };

    // Credit prize pool to winner's user account
    if (winnerParticipant.user && tournament.prizePool > 0) {
      const winnerUser = await User.findById(winnerParticipant.user);
      if (winnerUser) {
        winnerUser.totalPoints += tournament.prizePool;
        winnerUser.weeklyPoints += tournament.prizePool;
        winnerUser.monthlyPoints += tournament.prizePool;
        await winnerUser.save();
      }
    }

    await tournament.save();
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
