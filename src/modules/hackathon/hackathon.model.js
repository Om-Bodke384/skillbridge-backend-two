const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    banner: { type: String, default: null },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isGlobal: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'registration', 'active', 'judging', 'completed'], default: 'upcoming' },
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    prizes: [
      {
        position: String,
        reward: String,
        description: String,
      },
    ],
    rules: [{ type: String }],
    themes: [{ type: String }],
    techStack: [{ type: String }],
    maxTeamSize: { type: Number, default: 4 },
    minTeamSize: { type: Number, default: 1 },
    teams: [
      {
        name: String,
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        projectLink: String,
        projectTitle: String,
        projectDescription: String,
        submittedAt: Date,
        score: { type: Number, default: 0 },
        rank: { type: Number, default: null },
        feedback: String,
      },
    ],
    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sendInviteEmails: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hackathon', hackathonSchema);
