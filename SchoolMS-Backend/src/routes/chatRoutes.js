const router = require('express').Router();
const {protect} = require('../middlewares/authMiddleware');
const upload   = require('../middlewares/uploadMiddleware');
const ctrl     = require('../controllers/chatController');

router.use(protect);

router.get('/',                    ctrl.getConversations);
router.post('/',                   ctrl.createConversation);
router.get('/:id/messages',        ctrl.getMessages);
router.post('/:id/messages',       upload.single('image'), ctrl.sendMessage);
router.patch('/:id/read',          ctrl.markRead);
router.post('/:id/participants',   ctrl.addParticipants);
router.delete('/:id/leave',        ctrl.leaveConversation);

module.exports = router;
