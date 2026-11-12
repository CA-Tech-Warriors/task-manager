// /api/admin handlers. Owner: D (card D-1). Only admins reach these (see admin.routes.js).
const ApiError = require('../utils/ApiError');
const { User, Role, Task } = require('../models');

// GET /api/admin/users  200 [user, ...]  (each user includes role name)
exports.listUsers = async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Role, attributes: ['name'] }],
    order: [['id', 'ASC']],
  });

  const payload = users.map((entry) => {
    const user = entry.toJSON();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.Role?.name || 'user',
      createdAt: user.createdAt,
    };
  });

  return res.status(200).json(payload);
};

// DELETE /api/admin/users/:userId  204  |  400 when deleting yourself
exports.deleteUser = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId < 1) {
    throw ApiError.badRequest('Some of the details need fixing.', { userId: 'User ID must be a number.' });
  }

  if (userId === req.user.id) {
    throw ApiError.badRequest("You can't delete your own account.");
  }

  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found.');

  await user.destroy();
  return res.status(204).send();
};

// GET /api/admin/tasks  200 [task, ...]  (each task includes owner username)
exports.listTasks = async (req, res) => {
  const tasks = await Task.findAll({
    include: [{ model: User, attributes: ['username'] }],
    order: [['id', 'ASC']],
  });

  const payload = tasks.map((entry) => {
    const task = entry.toJSON();
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      owner: task.User?.username || null,
    };
  });

  return res.status(200).json(payload);
};

// DELETE /api/admin/tasks/:taskId  204
exports.deleteTask = async (req, res) => {
  const taskId = Number(req.params.taskId);
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw ApiError.badRequest('Some of the details need fixing.', { taskId: 'Task ID must be a number.' });
  }

  const task = await Task.findByPk(taskId);
  if (!task) throw ApiError.notFound('Task not found.');

  await task.destroy();
  return res.status(204).send();
};
