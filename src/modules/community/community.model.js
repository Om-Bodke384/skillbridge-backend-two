const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    avatar: { type: String, default: null },
    banner: { type: String, default: null },
    domain: {
      type: String,
      required: true,
      enum: [
        'Web Development', 'Mobile Development', 'Data Science',
        'Machine Learning', 'DevOps', 'Cybersecurity', 'Blockchain',
        'Cloud Computing', 'UI/UX Design', 'Other',
      ],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    whatsappLink: { type: String, default: null },
    discordLink: { type: String, default: null },
    telegramLink: { type: String, default: null },
    slackLink: { type: String, default: null },
    tags: [{ type: String }],
    rules: [{ type: String }],
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

communitySchema.index({ name: 'text', description: 'text', domain: 1 });

const Community = mongoose.model('Community', communitySchema);
module.exports = Community;
