const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const Session = require('../models/Session');
const dayjs = require('dayjs');

const generateTokens = (user) => {
  const payload = {id: user.id, role: user.role, name: user.name};

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(
    {...payload, jti: uuidv4()},
    process.env.JWT_REFRESH_SECRET,
    {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'},
  );

  return {accessToken, refreshToken};
};

const saveSession = async (userId, refreshToken, req) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    await Session.create({
      user_id: userId,
      refresh_token: refreshToken,
      device_info: req.headers['user-agent'] || null,
      ip_address: req.ip,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('Failed to save session:', error.message || error);
    throw error;
  }
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const invalidateSession = async (refreshToken) => {
  await Session.update({is_active: false}, {where: {refresh_token: refreshToken}});
};

const isSessionActive = async (refreshToken) => {
  const session = await Session.findOne({
    where: {refresh_token: refreshToken, is_active: true},
  });
  if (!session) return false;
  if (new Date(session.expires_at) < new Date()) {
    await session.update({is_active: false});
    return false;
  }
  return true;
};

module.exports = {generateTokens, saveSession, verifyRefreshToken, invalidateSession, isSessionActive};
