const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../common/middleware/auth.middleware');

router.get('/search', protect, userController.searchUsers);
router.get('/:id', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

module.exports = router;
