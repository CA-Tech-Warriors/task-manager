// /api/tasks handlers. Owner: C.
// Every query must be scoped to req.user.id so people only see their own tasks.
const ApiError = require('../utils/ApiError');
// const { Op } = require('sequelize');
// const { Task } = require('../models');

// GET /api/tasks?status=&priority=&search=&sortBy=createdAt|dueDate&order=asc|desc
// 200 [task, ...]  (tasks with no due date sort last)
exports.list = async (req, res) => {
  throw ApiError.notImplemented('C-4');
};

// GET /api/tasks/stats  200 { todo, 'in-progress', done, dueThisWeek }
exports.stats = async (req, res) => {
  throw ApiError.notImplemented('C-5');
};

// POST /api/tasks  body { title, description, status, priority, dueDate }  201 task
exports.create = async (req, res) => {
  throw ApiError.notImplemented('C-1');
};

// GET /api/tasks/:taskId  200 task  |  404 when missing or owned by someone else
exports.getById = async (req, res) => {
  throw ApiError.notImplemented('C-6');
};

// PUT /api/tasks/:taskId  body: any task fields (the Board sends only what changed)  200 task
exports.update = async (req, res) => {
  throw ApiError.notImplemented('C-3');
};

// DELETE /api/tasks/:taskId  204
exports.remove = async (req, res) => {
  throw ApiError.notImplemented('C-6');
};
