// Mounts every router. Already wired for the whole project:
// you shouldn't need to edit this file. Add routes inside your own *.routes.js.
const router = require('express').Router();

router.use('/health', require('./health.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
