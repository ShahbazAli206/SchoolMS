const router = require('express').Router();
const authRoutes    = require('./authRoutes');
const userRoutes    = require('./userRoutes');
const adminRoutes   = require('./adminRoutes');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const parentRoutes  = require('./parentRoutes');
const feeRoutes          = require('./feeRoutes');
const notificationRoutes = require('./notificationRoutes');
const chatRoutes         = require('./chatRoutes');
const complaintRoutes    = require('./complaintRoutes');
const eventRoutes        = require('./eventRoutes');

router.use('/auth',    authRoutes);
router.use('/users',   userRoutes);
router.use('/admin',   adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);
router.use('/parent',  parentRoutes);
router.use('/fees',          feeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat',          chatRoutes);
router.use('/complaints',    complaintRoutes);
router.use('/events',        eventRoutes);

router.get('/health', (req, res) => {
  res.json({success: true, message: 'SchoolMS API is running', timestamp: new Date().toISOString()});
});

module.exports = router;
