const router  = require('express').Router();
const {body}  = require('express-validator');
const {protect, authorize} = require('../middlewares/authMiddleware');
const upload  = require('../middlewares/uploadMiddleware');
const validate = require('../middlewares/validateRequest');
const ctrl    = require('../controllers/complaintController');

// ── Parent routes ──────────────────────────────────────────────────────────

router.post(
  '/',
  protect,
  authorize('parent'),
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('title is required').isLength({max: 200}),
    body('description').trim().notEmpty().withMessage('description is required'),
    body('student_id').optional().isInt({min: 1}),
    body('tagged_role').optional().isIn(['admin', 'principal', 'staff', 'teacher', 'parent']),
    body('tagged_user_id').optional().isInt({min: 1}),
  ],
  validate,
  ctrl.submitComplaint,
);

router.get('/my',                    protect, authorize('parent'), ctrl.getMyComplaints);
router.get('/received',              protect, authorize('parent'), ctrl.getReceivedComplaints);
router.get('/my/:id',                protect, authorize('parent'), ctrl.getComplaintById);
router.delete('/my/:id',             protect, authorize('parent'), ctrl.deleteComplaint);

// ── Teacher routes ─────────────────────────────────────────────────────────

router.post(
  '/teacher',
  protect,
  authorize('teacher'),
  upload.single('image'),
  [
    body('title').trim().notEmpty().isLength({max: 200}),
    body('description').trim().notEmpty(),
    body('student_id').isInt({min: 1}).withMessage('student_id is required'),
  ],
  validate,
  ctrl.teacherSubmitComplaint,
);

router.get('/teacher/inbox',         protect, authorize('teacher'), ctrl.teacherGetInbox);

// ── Staff routes ───────────────────────────────────────────────────────────

router.get('/staff',                 protect, authorize('staff'),     ctrl.staffGetAll);
router.get('/staff/stats',           protect, authorize('staff'),     ctrl.getStats);

// ── Principal routes ───────────────────────────────────────────────────────

router.get('/principal',             protect, authorize('principal'), ctrl.principalGetAll);
router.get('/principal/stats',       protect, authorize('principal'), ctrl.getStats);

// ── Admin routes ───────────────────────────────────────────────────────────

router.get('/admin/stats',           protect, authorize('admin'),     ctrl.adminGetStats);
router.get('/admin',                 protect, authorize('admin'),     ctrl.adminGetAll);
router.get('/admin/:id',             protect, authorize('admin'),     ctrl.adminGetOne);

// shared reply/status — anyone whose visibility includes the complaint
router.patch(
  '/:id/reply',
  protect,
  authorize('admin', 'principal', 'staff', 'teacher'),
  [
    body('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
    body('admin_reply').optional().isString(),
  ],
  validate,
  ctrl.replyOrUpdateStatus,
);

// back-compat: admin-specific PATCH
router.patch(
  '/admin/:id',
  protect,
  authorize('admin', 'principal'),
  [
    body('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
    body('admin_reply').optional().isString(),
  ],
  validate,
  ctrl.adminUpdateComplaint,
);

module.exports = router;
