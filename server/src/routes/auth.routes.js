// Owner: B
// Order on each route: rate limit or token, validate the input, check the database, run the handler.
const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const rules = require('../validators/auth.validators');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const db = require('../middleware/requireDatabase');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', authLimiter, validate(rules.registerRules), db, asyncHandler(auth.register));
router.post('/login', authLimiter, validate(rules.loginRules), db, asyncHandler(auth.login));

router.get('/me', requireAuth, db, asyncHandler(auth.me));
router.get('/profile', requireAuth, db, asyncHandler(auth.getProfile));
router.put('/profile', requireAuth, validate(rules.profileRules), db, asyncHandler(auth.updateProfile));
router.put('/password', requireAuth, validate(rules.passwordRules), db, asyncHandler(auth.changePassword));

module.exports = router;
