const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { protect } = require('../../common/middleware/auth.middleware');
const { uploadImage } = require('../../common/config/cloudinary'); // ADD


router.get('/', protect, chatController.getMessages);
router.post('/', protect, chatController.sendMessage);
router.delete('/:id', protect, chatController.deleteMessage);
router.post('/:id/react', protect, chatController.reactToMessage);
router.post('/upload',    protect, uploadImage.single('image'), chatController.uploadImage); // ADD

module.exports = router;
