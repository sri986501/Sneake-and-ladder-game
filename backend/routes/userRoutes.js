const express = require('express');
const {
  updateProfile,
  searchUsers,
  addFriend,
  removeFriend,
  claimDailyReward,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.put('/profile', updateProfile);
router.get('/search', searchUsers);
router.post('/friends/:id', addFriend);
router.delete('/friends/:id', removeFriend);
router.post('/daily-reward', claimDailyReward);
router.get('/stats', getUserStats);

module.exports = router;
