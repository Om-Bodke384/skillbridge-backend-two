const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const User = require('../../modules/users/user.model');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ApiError(401, 'Not authorized, invalid token'));
  }

  const user = await User.findById(decoded.id).select(
    '-password -refreshToken -emailVerificationToken -passwordResetToken'
  );

  if (!user) {
    return next(new ApiError(401, 'User belonging to this token no longer exists'));
  }

  if (!user.isActive) {
    return next(new ApiError(403, 'Your account has been deactivated. Contact support.'));
  }

  req.user = user;
  next();
});

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized for this action`)
      );
    }
    next();
  };
};

const requireAdminOrMentor = requireRole('admin', 'mentor');
const requireAdmin = requireRole('admin');

module.exports = { protect, requireRole, requireAdminOrMentor, requireAdmin };
