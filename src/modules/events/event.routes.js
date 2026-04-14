const express = require('express');
const router = express.Router();
const c = require('./event.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getEvents);
router.get('/:id', protect, c.getEvent);
router.post('/', protect, requireAdminOrMentor, c.createEvent);
router.post('/:id/register', protect, c.registerForEvent);
router.put('/:id', protect, c.updateEvent);

module.exports = router;
