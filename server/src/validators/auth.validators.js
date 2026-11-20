// Request rules for /api/auth. Owner: B (cards B-2, B-3, B-7).
// Each export is an array of express-validator checks, used as validate(rules) in auth.routes.js.
const { body } = require('express-validator');

const username = body('username')
  .trim()
  .notEmpty()
  .withMessage('Choose a username.')
  .bail()
  .isLength({ min: 3, max: 30 })
  .withMessage('Use 3 to 30 characters.')
  .matches(/^[A-Za-z0-9_.-]+$/)
  .withMessage('Use letters, numbers, dots, dashes or underscores.');

const email = body('email')
  .trim()
  .notEmpty()
  .withMessage('Enter your email address.')
  .bail()
  .isEmail()
  .withMessage('Enter a valid email address.');

// 8+ characters with at least one letter and one number.
const strongPassword = (field) =>
  body(field)
    .custom((value) => typeof value === 'string' && value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value))
    .withMessage('Password must be 8+ characters with a letter and a number.');

const registerRules = [username, email, strongPassword('password')];

// The username field may hold a username or an email.
const loginRules = [
  body('username').trim().notEmpty().withMessage('Enter your username or email.'),
  body('password').isString().notEmpty().withMessage('Enter your password.'),
];

const profileRules = [username, email];

const passwordRules = [
  body('currentPassword').isString().notEmpty().withMessage('Enter your current password.'),
  strongPassword('newPassword'),
];

module.exports = { registerRules, loginRules, profileRules, passwordRules };
