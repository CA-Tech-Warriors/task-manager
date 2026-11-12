// /api/auth handlers. Owner: B.
// Response shapes are in docs/API.md. The frontend depends on them.
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const config = require('../config');
const { User, Role } = require('../models');
const { signToken } = require('../utils/tokens');

// POST /api/auth/register  body { username, email, password }
// 201 { token, user }  |  400 field errors  |  409 username or email taken
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const userRole = await Role.findOne({ where: { name: 'user' } });
  if (!userRole) throw new ApiError(500, 'Server setup is incomplete. Missing role "user".');

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  const createdUser = await User.create({
    username,
    email,
    passwordHash,
    roleId: userRole.id,
  });

  const userWithRole = await User.findByPk(createdUser.id, {
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!userWithRole) throw ApiError.notFound('User not found after registration.');

  const payload = userWithRole.toJSON();
  const token = signToken(userWithRole);
  const user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.Role?.name || 'user',
    createdAt: payload.createdAt,
  };

  return res.status(201).json({ token, user });
};

// POST /api/auth/login  body { username, password, rememberMe }
// 200 { token, user }  |  401 { message } (same message for wrong username or password)
exports.login = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  const account = await User.scope('withPassword').findOne({
    where: { [Op.or]: [{ username }, { email: username }] },
    include: [{ model: Role, attributes: ['name'] }],
  });

  const invalidLoginMessage = 'Invalid username or password.';
  if (!account) throw ApiError.unauthorized(invalidLoginMessage);

  const passwordMatches = await bcrypt.compare(password || '', account.passwordHash);
  if (!passwordMatches) throw ApiError.unauthorized(invalidLoginMessage);

  const token = signToken(account, { remember: Boolean(rememberMe) });
  const payload = account.toJSON();
  const user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.Role?.name || 'user',
    createdAt: payload.createdAt,
  };

  return res.status(200).json({ token, user });
};

// GET /api/auth/me  200 { user }
exports.me = async (req, res) => {
  if (!req.user?.id) throw ApiError.unauthorized('Log in to continue.');

  const account = await User.findByPk(req.user.id, {
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['name'] }],
  });

  if (!account) {
    return res.status(200).json({
      user: {
        id: req.user.id,
        username: '',
        email: '',
        role: req.user.role || 'user',
        createdAt: null,
      },
    });
  }

  const payload = account.toJSON();
  const user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.Role?.name || req.user.role || 'user',
    createdAt: payload.createdAt,
  };

  return res.status(200).json({ user });
};

// GET /api/auth/profile  200 { user }
exports.getProfile = async (req, res) => {
  const account = await User.findByPk(req.user.id, {
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!account) throw ApiError.unauthorized('Log in to continue.');

  const payload = account.toJSON();
  const user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.Role?.name || req.user.role || 'user',
    createdAt: payload.createdAt,
  };

  return res.status(200).json({ user });
};

// PUT /api/auth/profile  body { username, email }  200 { user }
exports.updateProfile = async (req, res) => {
  const account = await User.findByPk(req.user.id, {
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['name'] }],
  });
  if (!account) throw ApiError.unauthorized('Log in to continue.');

  const updates = {};
  if (typeof req.body.username === 'string') updates.username = req.body.username.trim();
  if (typeof req.body.email === 'string') updates.email = req.body.email.trim();

  if (Object.keys(updates).length > 0) {
    await account.update(updates);
    await account.reload({
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Role, attributes: ['name'] }],
    });
  }

  const payload = account.toJSON();
  const user = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    role: payload.Role?.name || req.user.role || 'user',
    createdAt: payload.createdAt,
  };

  return res.status(200).json({ user });
};

// PUT /api/auth/password  body { currentPassword, newPassword }
// 200 { message }  |  400 { errors: { currentPassword } } when the current password is wrong
exports.changePassword = async (req, res) => {
  const account = await User.scope('withPassword').findByPk(req.user.id);
  if (!account) throw ApiError.unauthorized('Log in to continue.');

  const { currentPassword, newPassword } = req.body;
  const passwordMatches = await bcrypt.compare(currentPassword || '', account.passwordHash);
  if (!passwordMatches) {
    throw ApiError.badRequest('Some of the details need fixing.', {
      currentPassword: 'Current password is incorrect.',
    });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
  await account.update({ passwordHash: newPasswordHash });

  return res.status(200).json({ message: 'Password updated.' });
};
