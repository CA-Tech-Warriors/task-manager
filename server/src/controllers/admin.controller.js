// /api/admin handlers. Owner: D (card D-1). Only admins reach these (see admin.routes.js).
const ApiError = require('../utils/ApiError');
// const { User, Role, Task } = require('../models');

// GET /api/admin/users  200 [user, ...]  (each user includes role name)
exports.listUsers = async (req, res) => {
  throw ApiError.notImplemented('D-1');
};

// DELETE /api/admin/users/:userId  204  |  400 when deleting yourself
exports.deleteUser = async (req, res) => {
  throw ApiError.notImplemented('D-1');
};

// GET /api/admin/tasks  200 [task, ...]  (each task includes owner username)
exports.listTasks = async (req, res) => {
  throw ApiError.notImplemented('D-1');
};

// DELETE /api/admin/tasks/:taskId  204
exports.deleteTask = async (req, res) => {
  throw ApiError.notImplemented('D-1');
};
