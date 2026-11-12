// /api/tasks handlers. Owner: C.
// Every query must be scoped to req.user.id so people only see their own tasks.
const ApiError = require('../utils/ApiError');
const { Op, literal } = require('sequelize');
const { Task } = require('../models');
const { STATUSES, PRIORITIES, DESCRIPTION_MAX } = require('../constants');

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, '').trim();

// GET /api/tasks?status=&priority=&search=&sortBy=createdAt|dueDate&order=asc|desc
// 200 [task, ...]  (tasks with no due date sort last)
exports.list = async (req, res) => {
  const { status, priority, search } = req.query;
  const sortBy = req.query.sortBy === 'dueDate' ? 'dueDate' : 'createdAt';
  const sortOrder = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const where = { userId: req.user.id };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    where[Op.or] = [{ title: { [Op.iLike]: `%${term}%` } }, { description: { [Op.iLike]: `%${term}%` } }];
  }

  const order =
    sortBy === 'dueDate'
      ? [[literal('"Task"."dueDate" IS NULL'), 'ASC'], ['dueDate', sortOrder], ['createdAt', 'DESC']]
      : [['createdAt', sortOrder], ['id', 'ASC']];

  const tasks = await Task.findAll({ where, order });
  return res.status(200).json(tasks);
};

// GET /api/tasks/stats  200 { todo, 'in-progress', done, dueThisWeek }
exports.stats = async (req, res) => {
  const where = { userId: req.user.id };

  const [todo, inProgress, done] = await Promise.all([
    Task.count({ where: { ...where, status: 'todo' } }),
    Task.count({ where: { ...where, status: 'in-progress' } }),
    Task.count({ where: { ...where, status: 'done' } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const from = today.toISOString().slice(0, 10);
  const to = weekEnd.toISOString().slice(0, 10);

  const dueThisWeek = await Task.count({
    where: {
      ...where,
      dueDate: { [Op.between]: [from, to] },
    },
  });

  return res.status(200).json({ todo, 'in-progress': inProgress, done, dueThisWeek });
};

// POST /api/tasks  body { title, description, status, priority, dueDate }  201 task
exports.create = async (req, res) => {
  const title = stripHtml(req.body.title);
  const description = stripHtml(req.body.description || '');
  const status = req.body.status || 'todo';
  const priority = req.body.priority || 'medium';
  const dueDate = req.body.dueDate ?? null;

  const errors = {};
  if (!title) errors.title = 'Give your task a title.';
  if (!STATUSES.includes(status)) errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  if (!PRIORITIES.includes(priority)) errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
  if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description can be up to ${DESCRIPTION_MAX} characters.`;
  }
  if (!(dueDate === null || dueDate === '' || !Number.isNaN(new Date(dueDate).getTime()))) {
    errors.dueDate = 'Due date must be a valid date.';
  }
  if (Object.keys(errors).length) throw ApiError.badRequest('Some of the details need fixing.', errors);

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate === '' ? null : dueDate,
    userId: req.user.id,
  });

  return res.status(201).json(task);
};

// GET /api/tasks/:taskId  200 task  |  404 when missing or owned by someone else
exports.getById = async (req, res) => {
  const taskId = Number(req.params.taskId);
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw ApiError.badRequest('Some of the details need fixing.', { taskId: 'Task ID must be a number.' });
  }

  const task = await Task.findOne({ where: { id: taskId, userId: req.user.id } });
  if (!task) throw ApiError.notFound('Task not found.');

  return res.status(200).json(task);
};

// PUT /api/tasks/:taskId  body: any task fields (the Board sends only what changed)  200 task
exports.update = async (req, res) => {
  const taskId = Number(req.params.taskId);
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw ApiError.badRequest('Some of the details need fixing.', { taskId: 'Task ID must be a number.' });
  }

  const task = await Task.findOne({ where: { id: taskId, userId: req.user.id } });
  if (!task) throw ApiError.notFound('Task not found.');

  const updates = {};
  const errors = {};

  if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
    const title = stripHtml(req.body.title);
    if (!title) errors.title = 'Give your task a title.';
    else updates.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
    const description = stripHtml(req.body.description || '');
    if (description.length > DESCRIPTION_MAX) {
      errors.description = `Description can be up to ${DESCRIPTION_MAX} characters.`;
    } else {
      updates.description = description;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    if (!STATUSES.includes(req.body.status)) {
      errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
    } else {
      updates.status = req.body.status;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'priority')) {
    if (!PRIORITIES.includes(req.body.priority)) {
      errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
    } else {
      updates.priority = req.body.priority;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
    const { dueDate } = req.body;
    if (dueDate === null || dueDate === '') {
      updates.dueDate = null;
    } else if (Number.isNaN(new Date(dueDate).getTime())) {
      errors.dueDate = 'Due date must be a valid date.';
    } else {
      updates.dueDate = dueDate;
    }
  }

  if (Object.keys(errors).length) throw ApiError.badRequest('Some of the details need fixing.', errors);

  if (Object.keys(updates).length > 0) {
    await task.update(updates);
  }

  return res.status(200).json(task);
};

// DELETE /api/tasks/:taskId  204
exports.remove = async (req, res) => {
  const taskId = Number(req.params.taskId);
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw ApiError.badRequest('Some of the details need fixing.', { taskId: 'Task ID must be a number.' });
  }

  const task = await Task.findOne({ where: { id: taskId, userId: req.user.id } });
  if (!task) throw ApiError.notFound('Task not found.');

  await task.destroy();
  return res.status(204).send();
};
