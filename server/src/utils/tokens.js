// JWT helpers. Owner: B (card B-4).
const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(user, { remember = false } = {}) {
  return jwt.sign({ sub: String(user.id), role: user.Role?.name || user.role || 'user' }, config.jwtSecret, {
    expiresIn: remember ? config.jwtRememberExpiresIn : config.jwtExpiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };
