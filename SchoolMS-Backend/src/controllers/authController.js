const {Op} = require('sequelize');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const ApiResponse = require('../utils/ApiResponse');
const {generateTokens, saveSession, verifyRefreshToken, invalidateSession, isSessionActive} = require('../services/tokenService');
const {generateOTP, sendOTPEmail, saveOTP, verifyOTP, canResendOTP, incrementResend} = require('../services/otpService');
const logger = require('../config/logger');

const isFirstLoginToday = async (user) => {
  if (!user.last_login_at) return true;
  const lastLogin = new Date(user.last_login_at);
  const now = new Date();
  return lastLogin.toDateString() !== now.toDateString();
};

const isNewDevice = (user, req) => {
  const device = req.headers['user-agent'] || '';
  return user.last_login_device !== device;
};

exports.login = async (req, res, next) => {
  try {
    const {identifier, password, loginType = 'email'} = req.body;
    console.log('Login attempt:', { identifier, password: '***', loginType });

    const whereClause = {
      email: {email: identifier},
      phone: {phone: identifier},
      username: {username: identifier},
    }[loginType] || {email: identifier};

    console.log('Where clause:', whereClause);

    const user = await User.findOne({where: whereClause});
    console.log('User found:', user ? { id: user.id, username: user.username, email: user.email } : 'No user found');
    if (!user) return ApiResponse.unauthorized(res, 'Invalid credentials');
    if (!user.is_active) return ApiResponse.unauthorized(res, 'Account is deactivated. Contact admin.');

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) return ApiResponse.unauthorized(res, 'Invalid credentials');

    const needsOTP = process.env.NODE_ENV !== 'development' &&
      (await isFirstLoginToday(user) || isNewDevice(user, req));
    if (needsOTP) {
      if (!user.email) return ApiResponse.unauthorized(res, 'No email set. Cannot send OTP.');
      const otp = generateOTP();
      const purpose = isNewDevice(user, req) ? 'new_device' : 'login';
      await saveOTP(user.email, otp, purpose);
      await sendOTPEmail(user.email, otp, purpose);
      logger.info(`OTP sent to ${user.email} for ${purpose}`);
      return ApiResponse.success(res, {otpRequired: true, identifier: user.email}, 'OTP sent to your email');
    }

    const {accessToken, refreshToken} = generateTokens(user);
    await saveSession(user.id, refreshToken, req);
    await user.update({last_login_at: new Date(), last_login_device: req.headers['user-agent']});

    return ApiResponse.success(res, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      sessionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.verifyOTPHandler = async (req, res, next) => {
  try {
    const {identifier, otp} = req.body;
    const result = await verifyOTP(identifier, otp);
    if (!result.valid) return ApiResponse.error(res, result.message, 400);

    const user = await User.findOne({
      where: {[Op.or]: [{email: identifier}, {phone: identifier}]},
    });
    if (!user) return ApiResponse.notFound(res, 'User not found');

    const {accessToken, refreshToken} = generateTokens(user);
    await saveSession(user.id, refreshToken, req);
    await user.update({last_login_at: new Date(), last_login_device: req.headers['user-agent']});

    return ApiResponse.success(res, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      sessionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, 'OTP verified. Login successful');
  } catch (err) {
    next(err);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const {identifier} = req.body;
    const canResend = await canResendOTP(identifier);
    if (!canResend) return ApiResponse.error(res, 'Maximum OTP resend limit reached', 429);

    const user = await User.findOne({where: {email: identifier}});
    if (!user) return ApiResponse.notFound(res, 'User not found');

    const otp = generateOTP();
    await saveOTP(identifier, otp, 'login');
    await incrementResend(identifier);
    await sendOTPEmail(identifier, otp, 'login');

    return ApiResponse.success(res, {}, 'OTP resent successfully');
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {name, email, phone, username, password, role = 'student'} = req.body;
    const exists = await User.findOne({
      where: {[Op.or]: [{email}, phone ? {phone} : null, username ? {username} : null].filter(Boolean)},
    });
    if (exists) return ApiResponse.error(res, 'User with this email/phone/username already exists', 409);

    const user = await User.create({name, email, phone, username, password, role});
    return ApiResponse.created(res, {user: user.toJSON()}, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

exports.refreshTokenHandler = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;
    if (!refreshToken) return ApiResponse.unauthorized(res, 'No refresh token');

    const active = await isSessionActive(refreshToken);
    if (!active) return ApiResponse.unauthorized(res, 'Session expired. Please login again.');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) return ApiResponse.unauthorized(res, 'User not found or deactivated');

    await invalidateSession(refreshToken);
    const tokens = generateTokens(user);
    await saveSession(user.id, tokens.refreshToken, req);

    return ApiResponse.success(res, tokens, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;
    if (refreshToken) await invalidateSession(refreshToken);
    return ApiResponse.success(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    return ApiResponse.success(res, {user: user.toJSON()});
  } catch (err) {
    next(err);
  }
};

// ── Forgot Password: send OTP ─────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const {email} = req.body;
    const user = await User.findOne({where: {email}});
    // Always respond success to prevent email enumeration
    if (!user) return ApiResponse.success(res, {}, 'If that email exists, a reset OTP has been sent.');

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await PasswordReset.destroy({where: {email}});
    await PasswordReset.create({email, otp, expires_at: expiresAt});
    await sendOTPEmail(email, otp, 'forgot_password');

    logger.info(`Password reset OTP sent to ${email}`);
    return ApiResponse.success(res, {}, 'If that email exists, a reset OTP has been sent.');
  } catch (err) {
    next(err);
  }
};

// ── Reset Password: verify OTP + set new password ─────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const {email, otp, newPassword} = req.body;

    const record = await PasswordReset.findOne({
      where: {
        email,
        otp,
        is_used: false,
        expires_at: {[Op.gt]: new Date()},
      },
    });

    if (!record) return ApiResponse.error(res, 'Invalid or expired OTP', 400);

    const user = await User.findOne({where: {email}});
    if (!user) return ApiResponse.notFound(res, 'User not found');

    await user.update({password: newPassword});
    await record.update({is_used: true});
    logger.info(`Password reset successful for ${email}`);

    return ApiResponse.success(res, {}, 'Password reset successfully. Please login with your new password.');
  } catch (err) {
    next(err);
  }
};

// ── Update FCM Token ──────────────────────────────────────────────────────
exports.updateFcmToken = async (req, res, next) => {
  try {
    const {fcmToken} = req.body;
    if (!fcmToken) return ApiResponse.error(res, 'FCM token is required', 400);

    await User.update({fcm_token: fcmToken}, {where: {id: req.user.id}});
    return ApiResponse.success(res, {}, 'FCM token updated');
  } catch (err) {
    next(err);
  }
};

// ── Change Password (authenticated) ──────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const {currentPassword, newPassword} = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return ApiResponse.error(res, 'Current password is incorrect', 400);

    await user.update({password: newPassword});
    return ApiResponse.success(res, {}, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};
