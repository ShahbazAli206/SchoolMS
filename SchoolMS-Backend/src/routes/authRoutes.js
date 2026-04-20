const router = require('express').Router();
const {body} = require('express-validator');
const authController = require('../controllers/authController');
const {protect} = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 10,
  message: {success: false, message: 'Too many login attempts. Try again in 15 minutes.'},
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 5,
  message: {success: false, message: 'Too many OTP requests. Please wait.'},
});

router.post('/login',
  loginLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Identifier is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('loginType').optional().isIn(['email', 'phone', 'username']),
  ],
  validateRequest,
  authController.login,
);

router.post('/register',
  [
    body('name').trim().notEmpty().isLength({min: 2}).withMessage('Name is required (min 2 chars)'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'teacher', 'student', 'parent', 'staff']),
  ],
  validateRequest,
  authController.register,
);

router.post('/otp/send', otpLimiter, authController.resendOTP);

router.post('/otp/verify',
  [
    body('identifier').trim().notEmpty().withMessage('Identifier required'),
    body('otp').isLength({min: 6, max: 6}).isNumeric().withMessage('OTP must be 6 digits'),
  ],
  validateRequest,
  authController.verifyOTPHandler,
);

router.post('/otp/resend', otpLimiter, authController.resendOTP);

router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  validateRequest,
  authController.refreshTokenHandler,
);

router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);

// Forgot / reset password
router.post('/forgot-password',
  otpLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  validateRequest,
  authController.forgotPassword,
);

router.post('/reset-password',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({min: 6, max: 6}).isNumeric().withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({min: 8}).withMessage('Password must be at least 8 characters'),
  ],
  validateRequest,
  authController.resetPassword,
);

// Change password (authenticated)
router.post('/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({min: 8}).withMessage('New password must be at least 8 characters'),
  ],
  validateRequest,
  authController.changePassword,
);

// Update FCM token (authenticated)
router.post('/fcm-token',
  protect,
  [body('fcmToken').notEmpty().withMessage('FCM token required')],
  validateRequest,
  authController.updateFcmToken,
);

module.exports = router;
