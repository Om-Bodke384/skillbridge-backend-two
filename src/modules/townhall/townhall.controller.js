const townhallService = require('./townhall.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createTownhall = asyncHandler(async (req, res) => {
  const townhall = await townhallService.createTownhall(req.user._id, req.body);
  sendResponse(res, 201, townhall, 'Townhall created');
});

const getTownhalls = asyncHandler(async (req, res) => {
  const { communityId, status, page, limit } = req.query;
  const result = await townhallService.getTownhalls(communityId, status, parseInt(page), parseInt(limit));
  sendResponse(res, 200, result, 'Townhalls retrieved');
});

const getTownhall = asyncHandler(async (req, res) => {
  const townhall = await townhallService.getTownhallById(req.params.id);
  sendResponse(res, 200, townhall, 'Townhall retrieved');
});

const joinTownhall = asyncHandler(async (req, res) => {
  const townhall = await townhallService.joinTownhall(req.user._id, req.params.id);
  sendResponse(res, 200, townhall, 'Joined townhall');
});

const updateStatus = asyncHandler(async (req, res) => {
  const townhall = await townhallService.updateStatus(req.params.id, req.user._id, req.body.status);
  sendResponse(res, 200, townhall, 'Status updated');
});

const addPoll = asyncHandler(async (req, res) => {
  const townhall = await townhallService.addPoll(req.params.id, req.user._id, req.body);
  sendResponse(res, 200, townhall, 'Poll added');
});

const votePoll = asyncHandler(async (req, res) => {
  const townhall = await townhallService.votePoll(req.params.id, req.body.pollId, req.body.optionIndex, req.user._id);
  sendResponse(res, 200, townhall, 'Vote recorded');
});

module.exports = { createTownhall, getTownhalls, getTownhall, joinTownhall, updateStatus, addPoll, votePoll };
