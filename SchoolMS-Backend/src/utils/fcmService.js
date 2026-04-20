const admin  = require('firebase-admin');
const logger = require('../config/logger');

// ── Firebase Admin initialisation ─────────────────────────────────────────
// Place your Firebase service-account JSON at:
//   SchoolMS-Backend/firebase-service-account.json
// OR set the env var FIREBASE_SERVICE_ACCOUNT to the JSON string.
// If neither is present the module still loads safely — sends become no-ops.

let messaging = null;

const init = () => {
  if (admin.apps.length) {
    messaging = admin.messaging();
    return;
  }
  try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } else {
      // eslint-disable-next-line import/no-dynamic-require
      const serviceAccount = require('../../firebase-service-account.json');
      credential = admin.credential.cert(serviceAccount);
    }
    admin.initializeApp({credential});
    messaging = admin.messaging();
    logger.info('Firebase Admin initialised');
  } catch (e) {
    logger.warn(`Firebase Admin not initialised (${e.message}). Push notifications disabled.`);
  }
};

init();

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Send a push notification to a single FCM token.
 * @param {string} token   - The recipient's FCM token
 * @param {string} title   - Notification title
 * @param {string} body    - Notification body
 * @param {object} data    - Optional key/value data payload (all values must be strings)
 */
const sendToToken = async (token, title, body, data = {}) => {
  if (!messaging || !token) return null;
  try {
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );
    const response = await messaging.send({
      token,
      notification: {title, body},
      data: stringData,
      android: {priority: 'high'},
      apns: {payload: {aps: {sound: 'default', badge: 1}}},
    });
    return response;
  } catch (e) {
    logger.error(`FCM sendToToken failed: ${e.message}`);
    return null;
  }
};

/**
 * Send to multiple FCM tokens (max 500 per call — Firebase limit).
 */
const sendToMultiple = async (tokens, title, body, data = {}) => {
  if (!messaging || !tokens?.length) return null;
  const valid = tokens.filter(Boolean);
  if (!valid.length) return null;
  try {
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );
    const messages = valid.map(token => ({
      token,
      notification: {title, body},
      data: stringData,
      android: {priority: 'high'},
      apns: {payload: {aps: {sound: 'default', badge: 1}}},
    }));
    const response = await messaging.sendEach(messages);
    const failed = response.responses.filter(r => !r.success).length;
    if (failed) logger.warn(`FCM sendToMultiple: ${failed}/${valid.length} failed`);
    return response;
  } catch (e) {
    logger.error(`FCM sendToMultiple failed: ${e.message}`);
    return null;
  }
};

/**
 * Send to a FCM topic (e.g. 'class_5' subscribes all students in class 5).
 */
const sendToTopic = async (topic, title, body, data = {}) => {
  if (!messaging || !topic) return null;
  try {
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );
    const response = await messaging.send({
      topic,
      notification: {title, body},
      data: stringData,
      android: {priority: 'high'},
      apns: {payload: {aps: {sound: 'default', badge: 1}}},
    });
    return response;
  } catch (e) {
    logger.error(`FCM sendToTopic failed: ${e.message}`);
    return null;
  }
};

module.exports = {sendToToken, sendToMultiple, sendToTopic};
