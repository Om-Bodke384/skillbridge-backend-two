const communityService = require('./community.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createCommunity = asyncHandler(async (req, res) => {
  const community = await communityService.createCommunity(req.user._id, req.body);
  sendResponse(res, 201, community, 'Community created successfully');
});

const getAllCommunities = asyncHandler(async (req, res) => {
  const { page, limit, domain, search } = req.query;
  const result = await communityService.getAllCommunities(
    parseInt(page) || 1, parseInt(limit) || 12, domain, search
  );
  sendResponse(res, 200, result, 'Communities retrieved');
});

const getCommunity = asyncHandler(async (req, res) => {
  const community = await communityService.getCommunityById(req.params.id);
  sendResponse(res, 200, community, 'Community retrieved');
});

const joinCommunity = asyncHandler(async (req, res) => {
  const community = await communityService.joinCommunity(req.user._id, req.params.id);
  sendResponse(res, 200, community, 'Joined community successfully');
});

const leaveCommunity = asyncHandler(async (req, res) => {
  await communityService.leaveCommunity(req.user._id, req.params.id);
  sendResponse(res, 200, null, 'Left community successfully');
});

const updateCommunity = asyncHandler(async (req, res) => {
  const community = await communityService.updateCommunity(req.params.id, req.user._id, req.body);
  sendResponse(res, 200, community, 'Community updated');
});

const addMentor = asyncHandler(async (req, res) => {
  const community = await communityService.addMentor(req.params.id, req.user._id, req.body.mentorId);
  sendResponse(res, 200, community, 'Mentor added successfully');
});

const getMyCommunities = asyncHandler(async (req, res) => {
  const communities = await communityService.getMyCommunities(req.user._id);
  sendResponse(res, 200, communities, 'My communities retrieved');
});

module.exports = { createCommunity, getAllCommunities, getCommunity, joinCommunity, leaveCommunity, updateCommunity, addMentor, getMyCommunities };
