const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  videoUrl:    { type: String, required: true },   // Cloudinary video URL
  duration:    { type: Number, default: 0 },        // seconds
  order:       { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema({
  title:        { type: String, required: true, maxlength: 200 },
  description:  { type: String, required: true, maxlength: 2000 },
  thumbnail:    { type: String, default: null },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:     { type: String, enum: ['Web Dev', 'Mobile', 'Data Science', 'ML', 'DevOps', 'Design', 'Other'], default: 'Other' },
  lessons:      [lessonSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished:  { type: Boolean, default: false },
  tags:         [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);