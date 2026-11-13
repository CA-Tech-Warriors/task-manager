// /api/tasks handlers. Owner: C.
// Every query must be scoped to req.user.id so people only see their own tasks.
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
const { Task } = require('../models');
const { taskId } = require('../validators/task.validators');

// GET /api/tasks?status=&priority=&search=&sortBy=createdAt|dueDate&order=asc|desc
// 200 [task, ...]  (tasks with no due date sort last)

exports.list = async (req, res) => {
  //Search title and description (case-insensitive)

  //find all tasks for only current user
  const filters = {
    userId: req.user.id,
  };

  //filter by status and priority
  if (req.query.status) {
    filters.status = req.query.status;
  }

  if (req.query.priority) {
    filters.priority = req.query.priority;
  }

  //Sort by createdAt or dueDate, ascending or descending, with tasks that have no due date last
  const sortBy = req.query.sortBy || 'dueDate';
  const order = req.query.order || 'asc';

  const sorting = sortBy === 'dueDate' ? [[sortBy, order, 'NULLS LAST']] : [[sortBy, order]];

  const tasks = await Task.findAll({
    where: filters,
    order: sorting,
  });

  return res.status(200).json(tasks);
};

// GET /api/tasks/stats  200 { todo, 'in-progress', done, dueThisWeek }
exports.stats = async (req, res) => {};

// POST /api/tasks  body { title, description, status, priority, dueDate }  201 task
exports.create = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const newTask = await Task.create({
    userId: req.user.id,
    title,
    description,
    status,
    priority,
    dueDate,
  });

  res.status(201).json(newTask);
};

// GET /api/tasks/:taskId  200 task  |  404 when missing or owned by someone else
exports.getById = async (req, res) => {};

// PUT /api/tasks/:taskId  body: any task fields (the Board sends only what changed)  200 task
exports.update = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.findByPk(req.params.taskId);

  if (!task) {
    return res.status(404).json({ message: 'Task can not be found' });
  } else if (task.userId !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to edit this task.' });
  } else {
    await task.update({
      title,
      description,
      status,
      priority,
      dueDate,
    });
  }

  res.status(200).json(task);
};

// DELETE /api/tasks/:taskId  204
exports.remove = async (req, res) => {};
