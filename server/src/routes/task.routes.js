// Owner: C
// Order on each route: check the token, validate the input, check the database, run the handler.
const router = require('express').Router();
const tasks = require('../controllers/task.controller');
const rules = require('../validators/task.validators');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const db = require('../middleware/requireDatabase');
const asyncHandler = require('../utils/asyncHandler');

router.use(requireAuth);

router.get('/', validate(rules.listTaskRules), db, asyncHandler(tasks.list));
router.get('/stats', db, asyncHandler(tasks.stats)); // keep above /:taskId
router.post('/', validate(rules.createTaskRules), db, asyncHandler(tasks.create));
router.get('/:taskId', validate([rules.taskId]), db, asyncHandler(tasks.getById));
router.put('/:taskId', validate(rules.updateTaskRules), db, asyncHandler(tasks.update));
router.delete('/:taskId', validate([rules.taskId]), db, asyncHandler(tasks.remove));

module.exports = router;
