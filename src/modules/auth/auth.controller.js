const authService = require('./auth.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendResponse } = require('../../common/utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendResponse(res, 201, result, 'Registration successful. Please verify your email.');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendResponse(res, 200, { user: result.user, accessToken: result.accessToken }, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const result = await authService.refreshAccessToken(token);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendResponse(res, 200, { accessToken: result.accessToken }, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res.clearCookie('refreshToken');
  sendResponse(res, 200, null, 'Logged out successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, 200, null, 'Password reset email sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  sendResponse(res, 200, null, 'Password reset successful');
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.params.token);
  sendResponse(res, 200, null, 'Email verified successfully');
});

const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, req.user, 'Current user retrieved');
});

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, verifyEmail, getMe };
