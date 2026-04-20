const router  = require('express').Router();
const {protect, authorize} = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/feeController');

// ── Admin-only endpoints ───────────────────────────────────────────────────
router.get(   '/dashboard',              protect, authorize('admin'), ctrl.getFeeDashboard);
router.get(   '/',                       protect, authorize('admin'), ctrl.getAllFees);
router.post(  '/',                       protect, authorize('admin'), ctrl.createFee);
router.put(   '/:id',                    protect, authorize('admin'), ctrl.updateFee);
router.delete('/:id',                    protect, authorize('admin'), ctrl.deleteFee);
router.get(   '/student/:studentId',     protect, authorize('admin'), ctrl.getStudentFees);
router.get(   '/:feeId/payments',        protect, authorize('admin'), ctrl.getFeePayments);
router.post(  '/:feeId/payments',        protect, authorize('admin'), ctrl.recordPayment);

// ── Student-only endpoints ─────────────────────────────────────────────────
router.get('/my', protect, authorize('student'), ctrl.getMyFees);

// ── Parent-only endpoints ──────────────────────────────────────────────────
router.get('/child/:studentId', protect, authorize('parent'), ctrl.getChildFees);

module.exports = router;
