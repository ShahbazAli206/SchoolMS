const router = require('express').Router();
const {protect, authorize} = require('../middlewares/authMiddleware');
const {
  getMyChildren, getDashboardStats,
  getChildMarks, getChildAttendance, getChildAssignments,
} = require('../controllers/parentController');

router.use(protect, authorize('parent'));

router.get('/dashboard',                        getDashboardStats);
router.get('/children',                         getMyChildren);
router.get('/children/:studentId/marks',        getChildMarks);
router.get('/children/:studentId/attendance',   getChildAttendance);
router.get('/children/:studentId/assignments',  getChildAssignments);

module.exports = router;
