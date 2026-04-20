/**
 * notifyHelper — create a DB notification record AND fire FCM push.
 * Import this in any controller that needs to send notifications.
 */
const Notification   = require('../models/Notification');
const User           = require('../models/User');
const {sendToToken, sendToMultiple} = require('./fcmService');
const logger         = require('../config/logger');

/**
 * Notify one user.
 * @param {object} opts
 * @param {number}  opts.recipientId
 * @param {number}  [opts.senderId]
 * @param {string}  opts.title
 * @param {string}  opts.body
 * @param {string}  opts.type    — 'assignment'|'fee'|'attendance'|'marks'|'general'|'announcement'
 * @param {object}  [opts.data]  — extra JSON payload stored in DB + sent via FCM data
 */
const notifyUser = async ({recipientId, senderId = null, title, body, type = 'general', data = {}}) => {
  try {
    // Persist to DB
    await Notification.create({recipient_id: recipientId, sender_id: senderId, title, body, type, data});

    // Push via FCM
    const user = await User.findByPk(recipientId, {attributes: ['fcm_token']});
    if (user?.fcm_token) {
      await sendToToken(user.fcm_token, title, body, {type, ...data});
    }
  } catch (e) {
    logger.error(`notifyUser failed for recipient ${recipientId}: ${e.message}`);
  }
};

/**
 * Notify multiple users (by array of user IDs).
 */
const notifyMany = async ({recipientIds, senderId = null, title, body, type = 'general', data = {}}) => {
  if (!recipientIds?.length) return;
  try {
    // Bulk-insert notification records
    await Notification.bulkCreate(
      recipientIds.map(id => ({recipient_id: id, sender_id: senderId, title, body, type, data}))
    );

    // Collect FCM tokens and push
    const users = await User.findAll({
      where: {id: recipientIds},
      attributes: ['fcm_token'],
    });
    const tokens = users.map(u => u.fcm_token).filter(Boolean);
    if (tokens.length) {
      await sendToMultiple(tokens, title, body, {type, ...data});
    }
  } catch (e) {
    logger.error(`notifyMany failed: ${e.message}`);
  }
};

module.exports = {notifyUser, notifyMany};
