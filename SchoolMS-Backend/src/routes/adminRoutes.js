const router = require('express').Router();
const {body, param, query} = require('express-validator');
const adminController = require('../controllers/adminController');
const {protect, authorize} = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// ── Dashboard ─────────────────────────────────────────────────────────────
router.get('/stats', adminController.getDashboardStats);

// ── Students ──────────────────────────────────────────────────────────────
router.get('/students', adminController.getStudents);

router.post('/students',
  [
    body('name').trim().notEmpty().isLength({min: 2}).withMessage('Name required'),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').isLength({min: 8}).withMessage('Password min 8 chars'),
    body('roll_number').optional().trim(),
    body('admission_no').optional().trim(),
    body('class_id').optional().isInt(),
    body('date_of_birth').optional().isDate(),
  ],
  validateRequest,
  adminController.createStudent,
);

router.put('/students/:id',
  [param('id').isInt()],
  validateRequest,
  adminController.updateStudent,
);

router.delete('/students/:id',
  [param('id').isInt()],
  validateRequest,
  adminController.deleteStudent,
);

// ── Teachers ──────────────────────────────────────────────────────────────
router.get('/teachers', adminController.getTeachers);

router.post('/teachers',
  [
    body('name').trim().notEmpty().isLength({min: 2}),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').isLength({min: 8}),
    body('employee_id').optional().trim(),
    body('qualification').optional().trim(),
    body('specialization').optional().trim(),
    body('joining_date').optional().isDate(),
  ],
  validateRequest,
  adminController.createTeacher,
);

router.put('/teachers/:id',
  [param('id').isInt()],
  validateRequest,
  adminController.updateTeacher,
);

router.delete('/teachers/:id',
  [param('id').isInt()],
  validateRequest,
  adminController.deleteTeacher,
);

// ── User control ──────────────────────────────────────────────────────────
router.patch('/users/:userId/toggle-status',
  [param('userId').isInt()],
  validateRequest,
  adminController.toggleUserStatus,
);

router.patch('/users/:userId/role',
  [
    param('userId').isInt(),
    body('role').isIn(['admin', 'teacher', 'student', 'parent', 'staff']),
  ],
  validateRequest,
  adminController.assignRole,
);

module.exports = router;
