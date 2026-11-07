// Runs express-validator rules and answers 400 with { message, errors: { field: msg } }.
// Usage: router.post('/', validate(createTaskRules), asyncHandler(controller.create))
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

module.exports = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = {};
    result.array().forEach((e) => {
      const field = e.path || e.param;
      if (field && !errors[field]) errors[field] = e.msg;
    });
    return next(ApiError.badRequest('Some of the details need fixing.', errors));
  },
];
