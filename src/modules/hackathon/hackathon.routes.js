const express = require('express');
const router = express.Router();
const c = require('./hackathon.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getHackathons);
router.get('/:id', protect, c.getHackathon);
router.post('/', protect, requireAdminOrMentor, c.createHackathon);
router.post('/:id/register', protect, c.register);
router.post('/:id/teams', protect, c.createTeam);
router.post('/:id/submit', protect, c.submitProject);
router.patch('/:id/status', protect, requireAdminOrMentor, c.updateStatus);

module.exports = router;
