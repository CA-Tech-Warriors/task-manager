const ApiError = require('../utils/ApiError');

module.exports = (req, res, next) => next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));
