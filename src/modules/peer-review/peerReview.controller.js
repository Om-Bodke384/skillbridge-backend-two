const peerReviewService = require('./peerReview.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createPeerReview = asyncHandler(async (req, res) => {
  const pr = await peerReviewService.createPeerReview(req.user._id, req.body);
  sendResponse(res, 201, pr, 'Peer review session created');
});

const getPeerReviews = asyncHandler(async (req, res) => {
  const result = await peerReviewService.getPeerReviews(req.query);
  sendResponse(res, 200, result, 'Peer reviews retrieved');
});

const getPeerReview = asyncHandler(async (req, res) => {
  const pr = await peerReviewService.getPeerReviewById(req.params.id);
  sendResponse(res, 200, pr, 'Peer review retrieved');
});

const submitProject = asyncHandler(async (req, res) => {
  const pr = await peerReviewService.submitProject(req.params.id, req.user._id, req.body);
  sendResponse(res, 201, pr, 'Project submitted for review');
});

const submitReview = asyncHandler(async (req, res) => {
  const pr = await peerReviewService.submitReview(
    req.params.id, req.user._id, req.params.submissionId, req.body
  );
  sendResponse(res, 201, pr, 'Review submitted');
});

const getMyAssignments = asyncHandler(async (req, res) => {
  const data = await peerReviewService.getMyAssignments(req.params.id, req.user._id);
  sendResponse(res, 200, data, 'Assignments retrieved');
});

module.exports = { createPeerReview, getPeerReviews, getPeerReview, submitProject, submitReview, getMyAssignments };
