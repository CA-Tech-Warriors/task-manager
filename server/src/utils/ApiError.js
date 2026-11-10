// Throw one of these from any controller; errorHandler turns it into the
// standard response: { message, errors? }. Owner: D (card D-1).
class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // optional { field: 'message' }
  }

  static badRequest(message = 'Some of the details need fixing.', errors) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = 'Log in to continue.') {
    return new ApiError(401, message);
  }
  static forbidden(message = "You don't have permission to do that.") {
    return new ApiError(403, message);
  }
  static notFound(message = 'Not found.') {
    return new ApiError(404, message);
  }
  static conflict(message, errors) {
    return new ApiError(409, message, errors);
  }
  // Placeholder for routes that exist but aren't built yet.
  static notImplemented(card) {
    return new ApiError(501, `Not built yet (team card ${card}).`);
  }
}

module.exports = ApiError;
