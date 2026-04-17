const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');
const { getChatbotReply } = require('./chatbot.service');

const askChatbot = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  const reply = await getChatbotReply(message, history || []);
  sendResponse(res, 200, { reply }, 'Chatbot response');
});

module.exports = { askChatbot };