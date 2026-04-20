const router = require('express').Router();
const {body, param} = require('express-validator');
const userController = require('../controllers/userController');
const {protect, authorize} = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

router.use(protect);

// Self-update route (any authenticated user can update their own profile)
router.put('/me',
  [
    body('name').optional().trim().isLength({min: 2}),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone(),
    body('profile_image').optional().isURL(),
  ],
  validateRequest,
  userController.updateOwnProfile,
);

// Admin-only routes
router.use(authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', param('id').isInt(), validateRequest, userController.getUserById);
router.post('/',
  [
    body('name').trim().notEmpty().isLength({min: 2}),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').isLength({min: 8}),
    body('role').isIn(['admin', 'teacher', 'student', 'parent', 'staff']),
  ],
  validateRequest,
  userController.createUser,
);
router.put('/:id',
  [param('id').isInt(), body('name').optional().isLength({min: 2})],
  validateRequest,
  userController.updateUser,
);
router.delete('/:id', param('id').isInt(), validateRequest, userController.deleteUser);
router.patch('/:id/toggle-status', param('id').isInt(), validateRequest, userController.toggleStatus);
router.patch('/:id/role',
  [param('id').isInt(), body('role').isIn(['admin', 'teacher', 'student', 'parent', 'staff'])],
  validateRequest,
  userController.assignRole,
);

module.exports = router;
