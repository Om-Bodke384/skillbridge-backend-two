const mongoose = require('mongoose');

const peerReviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    task: { type: String, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isGlobal: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    status: { type: String, enum: ['open', 'reviewing', 'completed'], default: 'open' },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        projectLink: { type: String, required: true },
        projectTitle: { type: String, required: true },
        projectDescription: { type: String },
        techStack: [String],
        submittedAt: { type: Date, default: Date.now },
        reviews: [
          {
            reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 },
            feedback: { type: String, maxlength: 2000 },
            strengths: [String],
            improvements: [String],
            reviewedAt: { type: Date, default: Date.now },
          },
        ],
        assignedReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        averageRating: { type: Number, default: 0 },
      },
    ],
    maxReviewersPerSubmission: { type: Number, default: 2 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const PeerReview = mongoose.model('PeerReview', peerReviewSchema);
module.exports = PeerReview;
