// /api/auth handlers. Owner: B.
// Response shapes are in docs/API.md. The frontend depends on them.
const ApiError = require('../utils/ApiError');
// const bcrypt = require('bcryptjs');
// const config = require('../config');
// const { User, Role } = require('../models');
// const { signToken } = require('../utils/tokens');

// POST /api/auth/register  body { username, email, password }
// 201 { token, user }  |  400 field errors  |  409 username or email taken
// TODO B-1, B-2: hash with bcrypt.hash(password, config.bcryptRounds), role "user".
exports.register = async (req, res) => {
  throw ApiError.notImplemented('B-2');
};

// POST /api/auth/login  body { username, password, rememberMe }
// 200 { token, user }  |  401 { message } (same message for wrong username or password)
// TODO B-3, B-4: find by username OR email; signToken(user, { remember: rememberMe }).
exports.login = async (req, res) => {
  throw ApiError.notImplemented('B-3');
};

// GET /api/auth/me  200 { user }
exports.me = async (req, res) => {
  throw ApiError.notImplemented('B-3');
};

// GET /api/auth/profile  200 { user }
exports.getProfile = async (req, res) => {
  throw ApiError.notImplemented('B-7');
};

// PUT /api/auth/profile  body { username, email }  200 { user }
exports.updateProfile = async (req, res) => {
  throw ApiError.notImplemented('B-7');
};

// PUT /api/auth/password  body { currentPassword, newPassword }
// 200 { message }  |  400 { errors: { currentPassword } } when the current password is wrong
exports.changePassword = async (req, res) => {
  throw ApiError.notImplemented('B-7');
};
