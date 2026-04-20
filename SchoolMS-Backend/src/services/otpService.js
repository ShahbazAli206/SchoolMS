const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OtpVerification = require('../models/OtpVerification');
const {Op} = require('sequelize');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS},
  });

const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const transporter = createTransporter();
  const purposeLabel = {login: 'Daily Login', new_device: 'New Device Login', forgot_password: 'Password Reset'}[purpose];

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `SchoolMS — ${purposeLabel} OTP`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px">
        <h2 style="color:#1A73E8;margin-bottom:8px">SchoolMS</h2>
        <p style="color:#666">Your ${purposeLabel} verification code:</p>
        <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1A73E8;padding:16px 0">${otp}</div>
        <p style="color:#666;font-size:13px">This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share it.</p>
      </div>
    `,
  });
};

const saveOTP = async (identifier, otp, purpose = 'login') => {
  await OtpVerification.destroy({where: {identifier, is_verified: false}});
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10) * 60 * 1000);
  return OtpVerification.create({identifier, otp, purpose, expires_at: expiresAt});
};

const verifyOTP = async (identifier, otp) => {
  const record = await OtpVerification.findOne({
    where: {
      identifier,
      otp,
      is_verified: false,
      expires_at: {[Op.gt]: new Date()},
    },
    order: [['created_at', 'DESC']],
  });

  if (!record) return {valid: false, message: 'Invalid or expired OTP'};

  await record.update({is_verified: true});
  return {valid: true};
};

const canResendOTP = async (identifier) => {
  const record = await OtpVerification.findOne({
    where: {identifier, is_verified: false},
    order: [['created_at', 'DESC']],
  });
  if (!record) return true;
  const maxResends = parseInt(process.env.OTP_MAX_RESENDS, 10) || 3;
  return record.resend_count < maxResends;
};

const incrementResend = async (identifier) => {
  await OtpVerification.increment('resend_count', {where: {identifier, is_verified: false}});
};

module.exports = {generateOTP, sendOTPEmail, saveOTP, verifyOTP, canResendOTP, incrementResend};
