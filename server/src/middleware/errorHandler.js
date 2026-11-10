// Error handler (card D-1)
//
// Express sends every error here, and we answer with one JSON shape: { message, errors? }
// message: a sentence someone can read
// errors:  only when particular fields are wrong, e.g. { title: 'Give your task a title.' }

const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// PostgreSQL codes for "this value is in the wrong format" (bad number, date or enum value).
const BAD_FORMAT_CODES = new Set(['22P02', '22007', '22008']);

// Sequelize lists each problem separately. Collect them as { field: message }.
function fieldErrors(err) {
  const result = {};
  for (const item of err.errors || []) result[item.path] = item.message;
  return result;
}

// Library errors we know how to explain. Each rule checks an error and, if it matches, says which ApiError to send instead.
// Order matters: UniqueConstraintError is a kind of ValidationError, so it goes first.
const RULES = [
  {
    matches: (e) => e instanceof UniqueConstraintError,
    convert: (e) => ApiError.conflict('That already exists.', fieldErrors(e)),
  },
  {
    matches: (e) => e instanceof ValidationError,
    convert: (e) => ApiError.badRequest('Some of the details need fixing.', fieldErrors(e)),
  },
  {
    matches: (e) => e instanceof ForeignKeyConstraintError,
    convert: () => ApiError.badRequest('That refers to something that does not exist.'),
  },
  {
    matches: (e) => e instanceof DatabaseError && BAD_FORMAT_CODES.has(e.parent?.code),
    convert: () => ApiError.badRequest('One of the values is not in the right format.'),
  },
  {
    matches: (e) => e.type === 'entity.parse.failed',
    convert: () => ApiError.badRequest('The request body is not valid JSON.'),
  },
  {
    matches: (e) => e.type === 'entity.too.large',
    convert: () => new ApiError(413, 'The request body is too large.'),
  },
];

// Returns an ApiError for errors we recognize, or null for anything unexpected.
function toApiError(err) {
  if (err instanceof ApiError) return err;
  const rule = RULES.find((r) => r.matches(err));
  return rule ? rule.convert(err) : null;
}

// Express only treats a middleware as an error handler when it takes all four
// arguments, so `next` has to stay even though it isn't used.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const apiError = toApiError(err);

  if (apiError) {
    const body = { message: apiError.message };
    if (apiError.errors) body.errors = apiError.errors;
    return res.status(apiError.status).json(body);
  }

  // Something we didn't expect: log it and answer with a 500.
  // In production, never reveal the real message or the stack trace.
  if (!config.isTest) console.error(err);
  if (config.isProduction) return res.status(500).json({ message: 'Something went wrong.' });
  return res.status(500).json({ message: err.message, stack: err.stack });
}

module.exports = errorHandler;
