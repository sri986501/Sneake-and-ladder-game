const express = require('express');
const {
  getAllUsers,
  deleteUser,
  resetLeaderboard,
  getMatchLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.post('/reset-leaderboard', resetLeaderboard);
router.get('/matches', getMatchLogs);

module.exports = router;
