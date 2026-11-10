//ApiError (card D-1)
//
// ApiError is an Error with an HTTP status code attached (like 404 or 403).
// When something goes wrong in a controller, throw one:
//   throw ApiError.notFound('Task not found.');
// errorHandler.js catches it and sends this JSON to the frontend:
//   { message: 'Task not found.' }
// If specific fields are wrong, it also includes them:
//   { message: '...', errors: { title: 'Give your task a title.' } }
  

// What people see when a controller doesn't pass its own message.
const DEFAULT_MESSAGES = {
  400: 'Some of the details need fixing.',
  401: 'Log in to continue.',
  403: "You don't have permission to do that.",
  404: 'Not found.',
  409: 'That already exists.',
  503: 'The service is not available right now.',
};

class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} [message] - falls back to the default for that status
   * @param {Object<string, string>} [errors] - per-field messages, e.g. { email: 'Enter a valid email.' }
   */
  constructor(status, message = DEFAULT_MESSAGES[status], errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (errors) this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message) {
    return new ApiError(401, message);
  }

  static forbidden(message) {
    return new ApiError(403, message);
  }

  static notFound(message) {
    return new ApiError(404, message);
  }

  static conflict(message, errors) {
    return new ApiError(409, message, errors);
  }

  static unavailable(message) {
    return new ApiError(503, message);
  }

  // For routes that are wired up but not written yet.
  static notImplemented(card) {
    return new ApiError(501, `Not built yet (team card ${card}).`);
  }
}

module.exports = ApiError;
