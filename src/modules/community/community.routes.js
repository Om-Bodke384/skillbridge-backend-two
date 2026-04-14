const express = require('express');
const router = express.Router();
const communityController = require('./community.controller');
const { protect, requireAdminOrMentor } = require('../../common/middleware/auth.middleware');

router.get('/', communityController.getAllCommunities);
router.get('/my', protect, communityController.getMyCommunities);
router.get('/:id', communityController.getCommunity);
router.post('/', protect, requireAdminOrMentor, communityController.createCommunity);
router.put('/:id', protect, communityController.updateCommunity);
router.post('/:id/join', protect, communityController.joinCommunity);
router.post('/:id/leave', protect, communityController.leaveCommunity);
router.post('/:id/mentors', protect, communityController.addMentor);

module.exports = router;
