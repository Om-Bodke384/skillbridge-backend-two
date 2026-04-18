const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../common/middleware/auth.middleware');
const { uploadImage } = require('../../common/config/cloudinary');

router.get('/search', protect, userController.searchUsers);
router.get('/:id', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.patch('/avatar', protect, uploadImage.single('avatar'), userController.updateAvatar);

module.exports = router;
