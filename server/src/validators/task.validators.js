// Request rules for /api/tasks. Owner: C (cards C-1, C-2, C-4).
const { body, param, query } = require('express-validator');
const { STATUSES, PRIORITIES, TITLE_MAX, DESCRIPTION_MAX } = require('../constants');
const sanitizeHtml = require('sanitize-html');

const taskId = param('taskId').isInt({ min: 1 }).withMessage('Task ID must be a number.');

// strip HTML from title and description.
const title = body('title')
  .customSanitizer((value) => {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    });
  })
  .trim()
  .notEmpty()
  .withMessage('Give your task a title.')
  .isLength({ max: TITLE_MAX })
  .withMessage(`Keep the title to ${TITLE_MAX} characters or fewer.`);

// description length, status in STATUSES, priority in PRIORITIES,
const description = body('description')
  .optional()
  .customSanitizer((value) => {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    });
  })
  .trim()
  .isLength({ max: DESCRIPTION_MAX })
  .withMessage(`Keep the description to ${DESCRIPTION_MAX} characters or fewer.`);

const status = body('status')
  .optional()
  .isIn(STATUSES)
  .withMessage(`Status must be one of: ${STATUSES.join(', ')}.`);

const priority = body('priority')
  .optional()
  .isIn(PRIORITIES)
  .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}.`);

// dueDate an ISO date or null.
const dueDate = body('dueDate')
  .optional({ values: 'null' })
  .isISO8601()
  .withMessage('Date must be a valid ISO 8601 format (YYYY-MM-DD)');

//update tasks
const updateTitle = body('title')
  .optional()
  .customSanitizer((value) => {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    });
  })
  .trim()
  .notEmpty()
  .withMessage('Give your task a title.')
  .isLength({ max: TITLE_MAX })
  .withMessage(`Keep the title to ${TITLE_MAX} characters or fewer.`);

const createTaskRules = [title, description, status, priority, dueDate];
const updateTaskRules = [taskId, updateTitle, description, status, priority, dueDate];

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
  query('sortBy').optional().isIn(['createdAt', 'dueDate']).withMessage('Sort by must be createdAt or dueDate.'),
  query('order').optional().isIn(['asc', 'desc']).withMessage(`Order must be ascending (asc) or descending (desc).`),
];

module.exports = { taskId, createTaskRules, updateTaskRules, listTaskRules };
