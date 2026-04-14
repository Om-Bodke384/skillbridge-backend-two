const adminService = require('./admin.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats();
  sendResponse(res, 200, data, 'Dashboard stats retrieved');
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await adminService.getAllUsers(parseInt(page), parseInt(limit), role, search);
  sendResponse(res, 200, result, 'Users retrieved');
});

const changeRole = asyncHandler(async (req, res) => {
  const user = await adminService.changeUserRole(req.params.userId, req.body.role, req.user._id);
  sendResponse(res, 200, user, 'Role updated');
});

const toggleStatus = asyncHandler(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.userId, req.user._id);
  sendResponse(res, 200, user, 'User status toggled');
});

const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.userId, req.user._id);
  sendResponse(res, 200, null, 'User deleted');
});

const getCommunities = asyncHandler(async (req, res) => {
  const result = await adminService.getAllCommunities(parseInt(req.query.page), parseInt(req.query.limit));
  sendResponse(res, 200, result, 'Communities retrieved');
});

const toggleCommunity = asyncHandler(async (req, res) => {
  const community = await adminService.toggleCommunityStatus(req.params.communityId);
  sendResponse(res, 200, community, 'Community status toggled');
});

module.exports = { getDashboard, getUsers, changeRole, toggleStatus, deleteUser, getCommunities, toggleCommunity };
