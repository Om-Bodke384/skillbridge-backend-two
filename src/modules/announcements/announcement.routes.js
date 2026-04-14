const express = require('express');
const router = express.Router();
const c = require('./announcement.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getAnnouncements);
router.get('/:id', protect, c.getAnnouncement);
router.post('/', protect, requireAdminOrMentor, c.createAnnouncement);
router.patch('/:id/read', protect, c.markAsRead);
router.patch('/:id/pin', protect, requireAdminOrMentor, c.togglePin);
router.delete('/:id', protect, requireAdminOrMentor, c.deleteAnnouncement);

module.exports = router;
