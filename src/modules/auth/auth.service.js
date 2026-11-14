const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User   = require('./auth.model');
const { ApiError } = require('../../common/utils/apiResponse');
const { sendEmail } = require('../../common/config/email');
const {
  getWelcomeEmailTemplate,
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} = require('../../common/utils/emailTemplates');
const logger = require('../../common/utils/logger');

const TECH_DOMAINS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cybersecurity', 'Blockchain', 'Cloud Computing', 'UI/UX Design', 'Other',
];

let googleClient;
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, 'Google sign-in is not configured on the server');
  }
  if (!googleClient) googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
};

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

  // Account created through Google has no password
  if (!user.password) {
    throw new ApiError(
      400,
      'This account uses Google sign-in. Please click "Continue with Google", or use "Forgot password" to set a password.'
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isActive) throw new ApiError(403, 'Account deactivated. Contact support.');

  user.lastSeen = new Date();
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

// ─── Google Sign-In / Sign-Up ─────────────────────────────────────────────────
const googleLogin = async ({ credential, role, techDomain }) => {
  // 1. Verify the ID token with Google (signature, expiry, audience)
  let payload;
  try {
    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.warn('Google token verification failed:', err.message);
    throw new ApiError(401, 'Invalid Google sign-in. Please try again.');
  }

  if (!payload?.email || !payload.email_verified) {
    throw new ApiError(401, 'Your Google email is not verified');
  }

  const email    = payload.email.toLowerCase().trim();
  const googleId = payload.sub;

  // 2. Find existing account — by googleId first, then by email (account linking)
  let user = await User.findOne({ googleId });
  let isNewUser = false;

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      // Link Google to the existing account. Nothing else about the user changes.
      const wasUnverified = !user.isEmailVerified;
      user.googleId = googleId;
      if (!user.isEmailVerified) user.isEmailVerified = true; // Google already verified it
      if (!user.avatar && payload.picture) user.avatar = payload.picture;

      // Security: if the email was never verified, whoever registered it may not own it.
      // Google just proved the real owner, so drop the unverified password and old sessions.
      if (wasUnverified) {
        await User.updateOne({ _id: user._id }, { $unset: { password: 1, refreshToken: 1 } });
      }
    }
  }

  if (user) {
    if (!user.isActive) throw new ApiError(403, 'Account deactivated. Contact support.');
  } else {
    // 3. Brand-new user
    let name = (payload.name || '').trim().slice(0, 50);
    if (name.length < 2) name = email.split('@')[0].slice(0, 50).padEnd(2, '_');

    try {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        isEmailVerified: true,
        avatar: payload.picture || null,
        role: role === 'mentor' ? 'mentor' : 'student', // never admin from this endpoint
        techDomain: TECH_DOMAINS.includes(techDomain) ? techDomain : undefined,
      });
      isNewUser = true;
    } catch (err) {
      if (err.code !== 11000) throw err;
      // Two simultaneous requests — the other one created it first
      user = await User.findOne({ $or: [{ googleId }, { email }] });
      if (!user) throw err;
    }

    if (isNewUser) {
      sendEmailBackground({
        to: user.email,
        subject: 'Welcome to SkillBridge! 🚀',
        html: getWelcomeEmailTemplate(user.name),
      });
    }
  }

  // 4. Issue the same tokens as normal login
  user.lastSeen = new Date();
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken, isNewUser };
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
  register, login, googleLogin, refreshAccessToken,
  logout, forgotPassword, resetPassword, verifyEmail,
};
