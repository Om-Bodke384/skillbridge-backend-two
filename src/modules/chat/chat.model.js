const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'image', 'file', 'link'], default: 'text' },
    fileUrl: { type: String, default: null },
    room: { type: String, required: true }, // 'global' | 'community:<id>' | 'townhall:<id>'
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    townhallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Townhall', default: null },
    isDeleted: { type: Boolean, default: false },
    reactions: [
      {
        emoji: String,
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
