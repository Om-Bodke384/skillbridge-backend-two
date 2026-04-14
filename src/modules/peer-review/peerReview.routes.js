const express = require('express');
const router = express.Router();
const c = require('./peerReview.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getPeerReviews);
router.get('/:id', protect, c.getPeerReview);
router.get('/:id/assignments', protect, c.getMyAssignments);
router.post('/', protect, requireAdminOrMentor, c.createPeerReview);
router.post('/:id/submit', protect, c.submitProject);
router.post('/:id/submissions/:submissionId/review', protect, c.submitReview);

module.exports = router;
