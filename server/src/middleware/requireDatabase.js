// Answers 503 when the database isn't connected, instead of a confusing 500.
const { state } = require('../db');
const ApiError = require('../utils/ApiError');

module.exports = (req, res, next) =>
  state.connected ? next() : next(new ApiError(503, 'The database is not connected. Check DATABASE_URL.'));
