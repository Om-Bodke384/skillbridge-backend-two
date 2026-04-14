const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const User   = require('./auth.model');
const { ApiError } = require('../../common/utils/apiResponse');
const { sendEmail } = require('../../common/config/email');
const {
  getWelcomeEmailTemplate,
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} = require('../../common/utils/emailTemplates');
const logger = require('../../common/utils/logger');

// ─── Token helpers ────────────────────────────────────────────────────────────
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

// ✅ FIX: Send email in background — never block the API response
const sendEmailBackground = (options) => {
  sendEmail(options).catch((err) =>
    logger.error('Background email failed:', err.message)
  );
};

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async ({ name, email, password, role, techDomain }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password, role, techDomain });

  // Generate verification token
  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  // ✅ Send emails in background — don't await, don't block response
  sendEmailBackground({
    to: user.email,
    subject: 'SkillBridge — Verify your email',
    html: getVerifyEmailTemplate(user.name, verifyUrl),
  });
  sendEmailBackground({
    to: user.email,
    subject: 'Welcome to SkillBridge! 🚀',
    html: getWelcomeEmailTemplate(user.name),
  });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isActive) throw new ApiError(403, 'Account deactivated. Contact support.');

  user.lastSeen = new Date();
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw new ApiError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token mismatch or revoked');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found with that email');

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // ✅ Send in background — don't block
  sendEmailBackground({
    to: user.email,
    subject: 'SkillBridge — Password Reset',
    html: getPasswordResetTemplate(user.name, resetUrl),
  });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Reset token is invalid or has expired');

  user.password             = newPassword;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken:   hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Verification token is invalid or expired');

  user.isEmailVerified          = true;
  user.emailVerificationToken   = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

module.exports = {
  register, login, refreshAccessToken,
  logout, forgotPassword, resetPassword, verifyEmail,
};
