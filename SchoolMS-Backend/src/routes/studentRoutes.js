const router = require('express').Router();
const {protect, authorize} = require('../middlewares/authMiddleware');
const {
  getDashboardStats, getMyAssignments, getMyMarks,
  getMyAttendance, getMyMaterials,
} = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/dashboard',   getDashboardStats);
router.get('/assignments', getMyAssignments);
router.get('/marks',       getMyMarks);
router.get('/attendance',  getMyAttendance);
router.get('/materials',   getMyMaterials);

module.exports = router;
