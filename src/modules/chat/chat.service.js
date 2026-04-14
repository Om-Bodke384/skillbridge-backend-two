const Message = require('./chat.model');
const Community = require('../community/community.model');
const { ApiError } = require('../../common/utils/apiResponse');

const getMessages = async (room, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const messages = await Message.find({ room, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar role')
    .populate('replyTo', 'content sender');
  return messages.reverse();
};

const saveMessage = async ({ senderId, content, room, communityId, townhallId, type, fileUrl, replyTo }) => {
  // Community member check
  if (communityId) {
    const community = await Community.findById(communityId);
    if (!community) throw new ApiError(404, 'Community not found');
    if (!community.members.includes(senderId)) {
      throw new ApiError(403, 'You must be a member to send messages');
    }
  }

  const message = await Message.create({
    sender: senderId, content, room, communityId, townhallId, type, fileUrl, replyTo,
  });
  return message.populate('sender', 'name avatar role');
};

const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own messages');
  }
  message.isDeleted = true;
  message.content = 'This message was deleted';
  await message.save();
  return message;
};

const addReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  const existing = message.reactions.find((r) => r.emoji === emoji);
  if (existing) {
    const userIndex = existing.users.indexOf(userId);
    if (userIndex > -1) existing.users.splice(userIndex, 1);
    else existing.users.push(userId);
    if (existing.users.length === 0) {
      message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
    }
  } else {
    message.reactions.push({ emoji, users: [userId] });
  }
  await message.save();
  return message;
};

module.exports = { getMessages, saveMessage, deleteMessage, addReaction };
