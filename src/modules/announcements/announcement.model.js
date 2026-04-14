const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isGlobal: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    tags: [{ type: String }],
    attachments: [{ name: String, url: String }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

announcementSchema.index({ community: 1, createdAt: -1 });
announcementSchema.index({ isGlobal: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;
