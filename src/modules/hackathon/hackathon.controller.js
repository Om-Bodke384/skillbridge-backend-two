const hackathonService = require('./hackathon.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createHackathon = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.createHackathon(req.user._id, req.body);
  sendResponse(res, 201, hackathon, 'Hackathon created');
});

const getHackathons = asyncHandler(async (req, res) => {
  const result = await hackathonService.getHackathons(req.query);
  sendResponse(res, 200, result, 'Hackathons retrieved');
});

const getHackathon = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.getHackathonById(req.params.id);
  sendResponse(res, 200, hackathon, 'Hackathon retrieved');
});

const register = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.registerForHackathon(req.user._id, req.params.id);
  sendResponse(res, 200, hackathon, 'Registered successfully');
});

const createTeam = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.createTeam(req.params.id, req.user._id, req.body);
  sendResponse(res, 201, hackathon, 'Team created');
});

const submitProject = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.submitProject(req.params.id, req.user._id, req.body);
  sendResponse(res, 200, hackathon, 'Project submitted');
});

const updateStatus = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.updateStatus(req.params.id, req.user._id, req.body.status);
  sendResponse(res, 200, hackathon, 'Status updated');
});

module.exports = { createHackathon, getHackathons, getHackathon, register, createTeam, submitProject, updateStatus };
