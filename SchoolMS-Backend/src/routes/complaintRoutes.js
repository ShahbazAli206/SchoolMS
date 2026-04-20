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
    body('student_id').optional().isInt({min: 1}).withMessage('student_id must be a positive integer'),
  ],
  validate,
  ctrl.submitComplaint,
);

router.get(
  '/my',
  protect,
  authorize('parent'),
  ctrl.getMyComplaints,
);

router.get(
  '/my/:id',
  protect,
  authorize('parent'),
  ctrl.getComplaintById,
);

router.delete(
  '/my/:id',
  protect,
  authorize('parent'),
  ctrl.deleteComplaint,
);

// ── Admin routes ───────────────────────────────────────────────────────────

router.get(
  '/admin/stats',
  protect,
  authorize('admin'),
  ctrl.adminGetStats,
);

router.get(
  '/admin',
  protect,
  authorize('admin'),
  ctrl.adminGetAll,
);

router.get(
  '/admin/:id',
  protect,
  authorize('admin'),
  ctrl.adminGetOne,
);

router.patch(
  '/admin/:id',
  protect,
  authorize('admin'),
  [
    body('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
    body('admin_reply').optional().isString(),
  ],
  validate,
  ctrl.adminUpdateComplaint,
);

module.exports = router;
