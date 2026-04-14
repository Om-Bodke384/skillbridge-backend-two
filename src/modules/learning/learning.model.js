const mongoose = require('mongoose');

const learningPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    targetAudience: { type: String, maxlength: 500 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    estimatedDuration: { type: String },
    milestones: [
      {
        title: { type: String, required: true },
        description: String,
        order: Number,
        resources: [
          {
            title: String,
            url: String,
            type: { type: String, enum: ['video', 'article', 'book', 'course', 'other'] },
          },
        ],
        tasks: [
          {
            title: String,
            description: String,
            dueInDays: Number,
          },
        ],
        isCompleted: { type: Boolean, default: false },
      },
    ],
    enrolledStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        enrolledAt: { type: Date, default: Date.now },
        completedMilestones: [Number],
        progress: { type: Number, default: 0 },
      },
    ],
    isPublished: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const LearningPlan = mongoose.model('LearningPlan', learningPlanSchema);
module.exports = LearningPlan;
