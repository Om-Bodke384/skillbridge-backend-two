const mongoose = require('mongoose');

const townhallSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    hostedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isGlobal: { type: Boolean, default: true },
    scheduledAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
    agenda: [{ type: String }],
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxAttendees: { type: Number, default: 500 },
    recordingUrl: { type: String, default: null },
    tags: [{ type: String }],
    raisedHands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    polls: [
      {
        question: String,
        options: [{ text: String, votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Townhall', townhallSchema);
