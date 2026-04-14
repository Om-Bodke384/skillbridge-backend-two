const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../common/middleware/validate.middleware');
const { protect } = require('../../common/middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./dto/auth.dto');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', protect, authController.getMe);

module.exports = router;
