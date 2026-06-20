const express = require('express');
const {
  getTournaments,
  createTournament,
  joinTournament,
  contributePrize,
  startTournament,
  submitMatchResult,
  completeTournament
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTournaments);
router.post('/', createTournament);
router.post('/:id/join', joinTournament);
router.post('/:id/contribute', contributePrize);
router.post('/:id/start', startTournament);
router.post('/:id/submit-match', submitMatchResult);
router.post('/:id/complete', completeTournament);

module.exports = router;
