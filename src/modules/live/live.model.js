const mongoose = require('mongoose');

const liveSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  hostedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  streamKey:    { type: String, required: true, unique: true }, // Agora channel name
  agoraUid:     { type: Number, default: 0 },
  thumbnailUrl: { type: String, default: null },
  status:       { type: String, enum: ['live', 'ended'], default: 'live' },
  viewers:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  viewerCount:  { type: Number, default: 0 },
  startedAt:    { type: Date, default: Date.now },
  endedAt:      { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Live', liveSchema);