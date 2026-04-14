const LearningPlan = require('./learning.model');
const { ApiError } = require('../../common/utils/apiResponse');

const createPlan = async (creatorId, data) => {
  return LearningPlan.create({ ...data, createdBy: creatorId });
};

const getPlans = async ({ communityId, difficulty, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = { isPublished: true };
  if (communityId) filter.community = communityId;
  if (difficulty) filter.difficulty = difficulty;

  const [plans, total] = await Promise.all([
    LearningPlan.find(filter).skip(skip).limit(limit)
      .populate('createdBy', 'name avatar')
      .populate('community', 'name avatar')
      .select('-enrolledStudents'),
    LearningPlan.countDocuments(filter),
  ]);
  return { plans, total, page, pages: Math.ceil(total / limit) };
};

const getPlanById = async (id) => {
  const plan = await LearningPlan.findById(id)
    .populate('createdBy', 'name avatar role')
    .populate('community', 'name avatar')
    .populate('enrolledStudents.student', 'name avatar');
  if (!plan) throw new ApiError(404, 'Learning plan not found');
  return plan;
};

const enrollInPlan = async (planId, studentId) => {
  const plan = await LearningPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Learning plan not found');
  if (!plan.isPublished) throw new ApiError(400, 'This plan is not published yet');

  const alreadyEnrolled = plan.enrolledStudents.some(
    (e) => e.student.toString() === studentId.toString()
  );
  if (alreadyEnrolled) throw new ApiError(409, 'Already enrolled');

  plan.enrolledStudents.push({ student: studentId });
  await plan.save();
  return plan;
};

const updateProgress = async (planId, studentId, milestoneIndex) => {
  const plan = await LearningPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Learning plan not found');

  const enrollment = plan.enrolledStudents.find(
    (e) => e.student.toString() === studentId.toString()
  );
  if (!enrollment) throw new ApiError(403, 'You are not enrolled in this plan');

  if (!enrollment.completedMilestones.includes(milestoneIndex)) {
    enrollment.completedMilestones.push(milestoneIndex);
  }
  enrollment.progress = Math.round(
    (enrollment.completedMilestones.length / plan.milestones.length) * 100
  );
  await plan.save();
  return enrollment;
};

const updatePlan = async (planId, creatorId, data) => {
  const plan = await LearningPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Learning plan not found');
  if (plan.createdBy.toString() !== creatorId.toString()) throw new ApiError(403, 'Not authorized');
  Object.assign(plan, data);
  await plan.save();
  return plan;
};

module.exports = { createPlan, getPlans, getPlanById, enrollInPlan, updateProgress, updatePlan };
