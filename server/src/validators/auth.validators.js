// Request rules for /api/auth. Owner: B (cards B-2, B-3, B-7).
// Each export is an array of express-validator checks, used as validate(rules) in auth.routes.js.
const { body } = require('express-validator');

// One rule written out as the pattern to follow.
const username = body('username').trim().notEmpty().withMessage('Choose a username.');

// TODO B-2: length 3 to 30, allowed characters, email format,
// password 8+ characters with a letter and a number.
const registerRules = [username];

// TODO B-3: username field may hold a username or an email.
const loginRules = [body('username').trim().notEmpty().withMessage('Enter your username or email.')];

// TODO B-7
const profileRules = [];
const passwordRules = [];

module.exports = { registerRules, loginRules, profileRules, passwordRules };
