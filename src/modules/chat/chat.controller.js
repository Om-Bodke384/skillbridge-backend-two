const chatService = require('./chat.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const getMessages = asyncHandler(async (req, res) => {
  const { room, page, limit } = req.query;
  const messages = await chatService.getMessages(room, parseInt(page) || 1, parseInt(limit) || 50);
  sendResponse(res, 200, messages, 'Messages retrieved');
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.saveMessage({ senderId: req.user._id, ...req.body });
  sendResponse(res, 201, message, 'Message sent');
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await chatService.deleteMessage(req.params.id, req.user._id);
  sendResponse(res, 200, message, 'Message deleted');
});

const reactToMessage = asyncHandler(async (req, res) => {
  const message = await chatService.addReaction(req.params.id, req.user._id, req.body.emoji);
  sendResponse(res, 200, message, 'Reaction updated');
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded');
  sendResponse(res, 200, { url: req.file.path }, 'Image uploaded');
});

module.exports = { getMessages, sendMessage, deleteMessage, reactToMessage, uploadImage };
