const router = require('express').Router();
const {protect, authorize} = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/notificationController');

// All authenticated users
router.get(   '/my',              protect, ctrl.getMyNotifications);
router.get(   '/unread-count',    protect, ctrl.getUnreadCount);
router.patch( '/:id/read',        protect, ctrl.markRead);
router.patch( '/mark-all-read',   protect, ctrl.markAllRead);
router.delete('/:id',             protect, ctrl.deleteNotification);

// Admin only
router.post('/send',              protect, authorize('admin'), ctrl.adminSend);
router.get( '/admin/all',         protect, authorize('admin'), ctrl.adminGetAll);

module.exports = router;
