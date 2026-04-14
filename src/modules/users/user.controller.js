const userService = require('./user.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendResponse(res, 200, user, 'User profile retrieved');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendResponse(res, 200, user, 'Profile updated successfully');
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await userService.searchUsers(q, parseInt(page), parseInt(limit));
  sendResponse(res, 200, result, 'Users retrieved');
});

module.exports = { getProfile, updateProfile, searchUsers };
