// The one place errors become responses. Owner: D (card D-2).
// Every error response has the same shape: { message, errors? }
const { ValidationError, UniqueConstraintError } = require('sequelize');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let error = err;

  if (err instanceof UniqueConstraintError) {
    const errors = Object.fromEntries(err.errors.map((e) => [e.path, e.message]));
    error = ApiError.conflict('That already exists.', errors);
  } else if (err instanceof ValidationError) {
    const errors = Object.fromEntries(err.errors.map((e) => [e.path, e.message]));
    error = ApiError.badRequest('Some of the details need fixing.', errors);
  } else if (err.type === 'entity.parse.failed') {
    error = ApiError.badRequest('The request body is not valid JSON.');
  }

  const status = error.status || 500;
  if (status >= 500 && !config.isTest) console.error(err);

  const body = {
    message:
      status >= 500 && config.isProduction && !(error instanceof ApiError) ? 'Something went wrong.' : error.message,
  };
  if (error.errors) body.errors = error.errors;
  if (!config.isProduction && status >= 500 && !(error instanceof ApiError)) body.stack = err.stack;

  res.status(status).json(body);
};
