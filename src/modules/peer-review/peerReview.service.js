const PeerReview = require('./peerReview.model');
const { ApiError } = require('../../common/utils/apiResponse');

const createPeerReview = async (creatorId, data) => {
  return PeerReview.create({ ...data, createdBy: creatorId });
};

const getPeerReviews = async ({ communityId, status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (communityId) filter.community = communityId;
  if (status) filter.status = status;

  const [reviews, total] = await Promise.all([
    PeerReview.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })
      .populate('createdBy', 'name avatar')
      .populate('community', 'name avatar')
      .select('-submissions.reviews'),
    PeerReview.countDocuments(filter),
  ]);
  return { reviews, total, page, pages: Math.ceil(total / limit) };
};

const getPeerReviewById = async (id) => {
  const review = await PeerReview.findById(id)
    .populate('createdBy', 'name avatar role')
    .populate('community', 'name avatar')
    .populate('submissions.student', 'name avatar')
    .populate('submissions.reviews.reviewer', 'name avatar')
    .populate('submissions.assignedReviewers', 'name avatar');
  if (!review) throw new ApiError(404, 'Peer review session not found');
  return review;
};

/**
 * Submit project — then auto-assign this student to review others
 * Cross-review: each student reviews others' projects, not their own
 */
const submitProject = async (reviewSessionId, studentId, submissionData) => {
  const session = await PeerReview.findById(reviewSessionId);
  if (!session) throw new ApiError(404, 'Review session not found');
  if (session.status === 'completed') throw new ApiError(400, 'This review session is closed');

  const alreadySubmitted = session.submissions.some(
    (s) => s.student.toString() === studentId.toString()
  );
  if (alreadySubmitted) throw new ApiError(409, 'You have already submitted');

  session.submissions.push({
    student: studentId,
    ...submissionData,
  });

  // Auto-assign reviewers: assign this student to review existing submissions (max 2)
  const othersToReview = session.submissions
    .filter((s) => s.student.toString() !== studentId.toString())
    .filter((s) => s.assignedReviewers.length < session.maxReviewersPerSubmission)
    .slice(0, session.maxReviewersPerSubmission);

  for (const sub of othersToReview) {
    sub.assignedReviewers.push(studentId);
  }

  // Assign existing students to review this new submission
  const reviewersForNew = session.submissions
    .filter((s) => s.student.toString() !== studentId.toString())
    .map((s) => s.student)
    .slice(0, session.maxReviewersPerSubmission);

  const newSub = session.submissions[session.submissions.length - 1];
  newSub.assignedReviewers = reviewersForNew;

  if (session.status === 'open' && session.submissions.length >= 2) {
    session.status = 'reviewing';
  }

  await session.save();
  return session.populate([
    { path: 'submissions.student', select: 'name avatar' },
    { path: 'submissions.assignedReviewers', select: 'name avatar' },
  ]);
};

const submitReview = async (reviewSessionId, reviewerId, submissionId, reviewData) => {
  const session = await PeerReview.findById(reviewSessionId);
  if (!session) throw new ApiError(404, 'Review session not found');

  const submission = session.submissions.id(submissionId);
  if (!submission) throw new ApiError(404, 'Submission not found');

  if (submission.student.toString() === reviewerId.toString()) {
    throw new ApiError(403, 'You cannot review your own submission');
  }

  const isAssigned = submission.assignedReviewers
    .map((r) => r.toString())
    .includes(reviewerId.toString());
  if (!isAssigned) throw new ApiError(403, 'You are not assigned to review this submission');

  const alreadyReviewed = submission.reviews.some(
    (r) => r.reviewer.toString() === reviewerId.toString()
  );
  if (alreadyReviewed) throw new ApiError(409, 'You have already reviewed this submission');

  submission.reviews.push({ reviewer: reviewerId, ...reviewData });

  // Recalculate average rating
  const ratings = submission.reviews.map((r) => r.rating).filter(Boolean);
  submission.averageRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  await session.save();
  return session;
};

const getMyAssignments = async (reviewSessionId, studentId) => {
  const session = await PeerReview.findById(reviewSessionId)
    .populate('submissions.student', 'name avatar')
    .populate('submissions.reviews.reviewer', 'name avatar');
  if (!session) throw new ApiError(404, 'Review session not found');

  const toReview = session.submissions.filter((s) =>
    s.assignedReviewers.map((r) => r.toString()).includes(studentId.toString()) &&
    s.student.toString() !== studentId.toString() &&
    !s.reviews.some((r) => r.reviewer.toString() === studentId.toString())
  );

  const mySubmission = session.submissions.find(
    (s) => s.student.toString() === studentId.toString()
  );

  return { toReview, mySubmission };
};

module.exports = {
  createPeerReview, getPeerReviews, getPeerReviewById,
  submitProject, submitReview, getMyAssignments,
};
