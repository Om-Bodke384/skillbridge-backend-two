const express = require('express');
const router = express.Router();
const c = require('./townhall.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getTownhalls);
router.get('/:id', protect, c.getTownhall);
router.post('/', protect, requireAdminOrMentor, c.createTownhall);
router.post('/:id/join', protect, c.joinTownhall);
router.patch('/:id/status', protect, c.updateStatus);
router.post('/:id/polls', protect, requireAdminOrMentor, c.addPoll);
router.post('/:id/vote', protect, c.votePoll);

module.exports = router;
