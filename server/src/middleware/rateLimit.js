// Limits login and sign-up attempts. Owner: B (card B-5).
const rateLimit = require('express-rate-limit');
const config = require('../config');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { message: 'Too many attempts. Wait 15 minutes, then try again.' },
});

module.exports = { authLimiter };
