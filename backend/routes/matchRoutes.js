const express = require('express');
const { logMatch, getMyMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', logMatch);
router.get('/my', getMyMatches);

module.exports = router;
