const express = require('express');
const router = express.Router();
const { askChatbot } = require('./chatbot.controller');
const { protect } = require('../../common/middleware/auth.middleware');

// POST /api/chatbot/ask  (protected — only logged-in students)
router.post('/ask', protect, askChatbot);

module.exports = router;