// Owner: D
const router = require('express').Router();
const admin = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const requireDatabase = require('../middleware/requireDatabase');
const asyncHandler = require('../utils/asyncHandler');

router.use(requireAuth, requireRole('admin'), requireDatabase);

router.get('/users', asyncHandler(admin.listUsers));
router.delete('/users/:userId', asyncHandler(admin.deleteUser));
router.get('/tasks', asyncHandler(admin.listTasks));
router.delete('/tasks/:taskId', asyncHandler(admin.deleteTask));

module.exports = router;
