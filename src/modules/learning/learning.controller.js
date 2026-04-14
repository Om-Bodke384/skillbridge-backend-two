const learningService = require('./learning.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const createPlan = asyncHandler(async (req, res) => {
  const plan = await learningService.createPlan(req.user._id, req.body);
  sendResponse(res, 201, plan, 'Learning plan created');
});

const getPlans = asyncHandler(async (req, res) => {
  const result = await learningService.getPlans(req.query);
  sendResponse(res, 200, result, 'Plans retrieved');
});

const getPlan = asyncHandler(async (req, res) => {
  const plan = await learningService.getPlanById(req.params.id);
  sendResponse(res, 200, plan, 'Plan retrieved');
});

const enroll = asyncHandler(async (req, res) => {
  const plan = await learningService.enrollInPlan(req.params.id, req.user._id);
  sendResponse(res, 200, plan, 'Enrolled successfully');
});

const updateProgress = asyncHandler(async (req, res) => {
  const enrollment = await learningService.updateProgress(req.params.id, req.user._id, req.body.milestoneIndex);
  sendResponse(res, 200, enrollment, 'Progress updated');
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await learningService.updatePlan(req.params.id, req.user._id, req.body);
  sendResponse(res, 200, plan, 'Plan updated');
});

module.exports = { createPlan, getPlans, getPlan, enroll, updateProgress, updatePlan };
