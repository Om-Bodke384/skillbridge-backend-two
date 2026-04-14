const express = require('express');
const router = express.Router();
const c = require('./learning.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', protect, c.getPlans);
router.get('/:id', protect, c.getPlan);
router.post('/', protect, requireAdminOrMentor, c.createPlan);
router.post('/:id/enroll', protect, c.enroll);
router.patch('/:id/progress', protect, c.updateProgress);
router.put('/:id', protect, requireAdminOrMentor, c.updatePlan);

module.exports = router;
