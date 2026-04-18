const express = require('express');
const router = express.Router();
const c = require('./live.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/',          protect, c.getLiveSessions);           // all students see live sessions
router.post('/',         protect, requireAdminOrMentor, c.goLive); // only mentor/admin can go live
router.post('/:id/join', protect, c.joinLive);
router.patch('/:id/end', protect, c.endLive);

module.exports = router;