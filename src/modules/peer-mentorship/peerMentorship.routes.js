const express = require('express');
const router = express.Router();
const c = require('./peerMentorship.controller');
const { protect } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getRequests);
router.get('/:id', protect, c.getRequest);
router.post('/', protect, c.createRequest);
router.post('/:id/respond', protect, c.respond);
router.patch('/:id/responses/:responseId/accept', protect, c.acceptHelper);
router.patch('/:id/resolve', protect, c.resolveRequest);

module.exports = router;
