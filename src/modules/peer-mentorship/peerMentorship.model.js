const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
    isGlobal: { type: Boolean, default: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    skillsNeeded: [{ type: String }],
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    responses: [
      {
        helper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, maxlength: 2000 },
        isAccepted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, maxlength: 500, default: null },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

mentorshipRequestSchema.index({ community: 1, status: 1, createdAt: -1 });
const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);

// ─── Service ────────────────────────────────────────────────────────────────
const { ApiError } = require('../../common/utils/apiResponse');

const createRequest = async (requesterId, data) => {
  return MentorshipRequest.create({ ...data, requester: requesterId });
};

const getRequests = async ({ communityId, status, skillsNeeded, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (communityId) filter.community = communityId;
  if (status) filter.status = status;
  if (skillsNeeded) filter.skillsNeeded = { $in: skillsNeeded.split(',') };

  const [requests, total] = await Promise.all([
    MentorshipRequest.find(filter).skip(skip).limit(limit)
      .sort({ urgency: -1, createdAt: -1 })
      .populate('requester', 'name avatar role techDomain')
      .populate('mentor', 'name avatar')
      .populate('responses.helper', 'name avatar'),
    MentorshipRequest.countDocuments(filter),
  ]);
  return { requests, total, page, pages: Math.ceil(total / limit) };
};

const getRequestById = async (id) => {
  const request = await MentorshipRequest.findById(id)
    .populate('requester', 'name avatar role techDomain bio')
    .populate('mentor', 'name avatar role')
    .populate('responses.helper', 'name avatar role');
  if (!request) throw new ApiError(404, 'Mentorship request not found');
  return request;
};

const respondToRequest = async (requestId, helperId, message) => {
  const request = await MentorshipRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.requester.toString() === helperId.toString())
    throw new ApiError(403, 'You cannot respond to your own request');
  if (request.status === 'resolved') throw new ApiError(400, 'This request is already resolved');

  const alreadyResponded = request.responses.some(
    (r) => r.helper.toString() === helperId.toString()
  );
  if (alreadyResponded) throw new ApiError(409, 'You have already responded');

  request.responses.push({ helper: helperId, message });
  await request.save();
  return request.populate('responses.helper', 'name avatar role');
};

const acceptHelper = async (requestId, requesterId, responseId) => {
  const request = await MentorshipRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.requester.toString() !== requesterId.toString())
    throw new ApiError(403, 'Only the requester can accept');

  const response = request.responses.id(responseId);
  if (!response) throw new ApiError(404, 'Response not found');

  request.responses.forEach((r) => { r.isAccepted = false; });
  response.isAccepted = true;
  request.mentor = response.helper;
  request.status = 'in_progress';
  await request.save();
  return request;
};

const resolveRequest = async (requestId, requesterId, rating, feedback) => {
  const request = await MentorshipRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.requester.toString() !== requesterId.toString())
    throw new ApiError(403, 'Only the requester can resolve');

  request.status = 'resolved';
  request.resolvedAt = new Date();
  if (rating) request.rating = rating;
  if (feedback) request.feedback = feedback;
  await request.save();
  return request;
};

module.exports = { MentorshipRequest, createRequest, getRequests, getRequestById, respondToRequest, acceptHelper, resolveRequest };
