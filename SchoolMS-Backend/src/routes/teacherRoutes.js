const router = require('express').Router();
const {body, param, query} = require('express-validator');
const tc = require('../controllers/teacherController');
const {protect, authorize} = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect);
router.use(authorize('teacher', 'admin'));

// ── Dashboard stats ───────────────────────────────────────────────────────
router.get('/stats', tc.getTeacherStats);

// ── Classes & Students ────────────────────────────────────────────────────
router.get('/classes', tc.getMyClasses);
router.get('/classes/:class_id/students', param('class_id').isInt(), validateRequest, tc.getClassStudents);
router.get('/subjects', tc.getSubjects);

// ── Assignments ───────────────────────────────────────────────────────────
router.get('/assignments', tc.getAssignments);

router.post('/assignments',
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('due_date').isISO8601().withMessage('Valid due_date required'),
    body('class_id').optional().isInt(),
    body('student_id').optional().isInt(),
    body('subject_id').optional().isInt(),
    body('max_marks').optional().isFloat({min: 1}),
  ],
  validateRequest,
  tc.createAssignment,
);

router.put('/assignments/:id',
  upload.single('file'),
  [param('id').isInt()],
  validateRequest,
  tc.updateAssignment,
);

router.delete('/assignments/:id', param('id').isInt(), validateRequest, tc.deleteAssignment);

// ── Materials ─────────────────────────────────────────────────────────────
router.get('/materials', tc.getMaterials);

router.post('/materials',
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('class_id').optional().isInt(),
    body('subject_id').optional().isInt(),
  ],
  validateRequest,
  tc.uploadMaterial,
);

router.patch('/materials/:id',
  param('id').isInt(),
  [body('title').trim().notEmpty().withMessage('Title required')],
  validateRequest,
  tc.updateMaterial,
);
router.delete('/materials/:id', param('id').isInt(), validateRequest, tc.deleteMaterial);

// ── Marks ─────────────────────────────────────────────────────────────────
router.get('/marks', tc.getMarks);

router.post('/marks',
  [
    body('student_id').isInt().withMessage('student_id required'),
    body('subject_id').isInt().withMessage('subject_id required'),
    body('exam_type').isIn(['unit_test', 'mid_term', 'final', 'assignment', 'quiz']).withMessage('Invalid exam_type'),
    body('marks').isFloat({min: 0}).withMessage('marks required'),
    body('max_marks').optional().isFloat({min: 1}),
  ],
  validateRequest,
  tc.upsertMark,
);

router.post('/marks/bulk',
  [body('marks').isArray({min: 1}).withMessage('marks[] array required')],
  validateRequest,
  tc.bulkUpsertMarks,
);

router.delete('/marks/:id', param('id').isInt(), validateRequest, tc.deleteMark);

// ── Attendance ────────────────────────────────────────────────────────────
router.get('/attendance', tc.getAttendance);
router.get('/attendance/summary', tc.getAttendanceSummary);

router.post('/attendance',
  [
    body('student_id').isInt().withMessage('student_id required'),
    body('class_id').isInt().withMessage('class_id required'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('status').isIn(['present', 'absent', 'late', 'excused']),
  ],
  validateRequest,
  tc.markAttendance,
);

router.post('/attendance/bulk',
  [
    body('class_id').isInt().withMessage('class_id required'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('attendance').isArray({min: 1}).withMessage('attendance[] required'),
  ],
  validateRequest,
  tc.bulkMarkAttendance,
);

module.exports = router;
