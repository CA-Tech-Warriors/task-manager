// Request rules for /api/tasks. Owner: C (cards C-1, C-2, C-4).
const { body, param, query } = require('express-validator');
const { STATUSES, PRIORITIES, TITLE_MAX } = require('../constants');

const taskId = param('taskId').isInt({ min: 1 }).withMessage('Task ID must be a number.');

// One rule written out as the pattern to follow.
const title = body('title')
  .trim()
  .notEmpty()
  .withMessage('Give your task a title.')
  .isLength({ max: TITLE_MAX })
  .withMessage(`Keep the title to ${TITLE_MAX} characters or fewer.`);

// TODO C-1: description length, status in STATUSES, priority in PRIORITIES,
// dueDate an ISO date or null. TODO C-2: strip HTML from title and description.
const createTaskRules = [title];
const updateTaskRules = [taskId];

// TODO C-4: validate sortBy (createdAt | dueDate) and order (asc | desc).
const listTaskRules = [
  query('status')
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(', ')}.`),
  query('priority')
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}.`),
];

module.exports = { taskId, createTaskRules, updateTaskRules, listTaskRules };
