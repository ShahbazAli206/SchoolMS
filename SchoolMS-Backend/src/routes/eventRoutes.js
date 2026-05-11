const router = require('express').Router();
const {protect, authorize} = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/eventController');

router.use(protect);

// All authenticated users can list events visible to their role
router.get('/',         ctrl.listEvents);
router.get('/:id',      ctrl.getEvent);

// Admin / principal can create / update / delete
router.post('/',        authorize('admin', 'principal'), ctrl.createEvent);
router.put('/:id',      authorize('admin', 'principal'), ctrl.updateEvent);
router.delete('/:id',   authorize('admin', 'principal'), ctrl.deleteEvent);

module.exports = router;
