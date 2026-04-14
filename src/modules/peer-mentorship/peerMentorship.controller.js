const peerMentorshipService = require('./peerMentorship.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createRequest = asyncHandler(async (req, res) => {
  const request = await peerMentorshipService.createRequest(req.user._id, req.body);
  sendResponse(res, 201, request, 'Mentorship request created');
});

const getRequests = asyncHandler(async (req, res) => {
  const result = await peerMentorshipService.getRequests(req.query);
  sendResponse(res, 200, result, 'Requests retrieved');
});

const getRequest = asyncHandler(async (req, res) => {
  const request = await peerMentorshipService.getRequestById(req.params.id);
  sendResponse(res, 200, request, 'Request retrieved');
});

const respond = asyncHandler(async (req, res) => {
  const request = await peerMentorshipService.respondToRequest(
    req.params.id, req.user._id, req.body.message
  );
  sendResponse(res, 201, request, 'Response submitted');
});

const acceptHelper = asyncHandler(async (req, res) => {
  const request = await peerMentorshipService.acceptHelper(
    req.params.id, req.user._id, req.params.responseId
  );
  sendResponse(res, 200, request, 'Helper accepted');
});

const resolveRequest = asyncHandler(async (req, res) => {
  const request = await peerMentorshipService.resolveRequest(
    req.params.id, req.user._id, req.body.rating, req.body.feedback
  );
  sendResponse(res, 200, request, 'Request resolved');
});

module.exports = { createRequest, getRequests, getRequest, respond, acceptHelper, resolveRequest };
