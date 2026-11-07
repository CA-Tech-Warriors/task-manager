// requireAuth and requireRole. Owner: B.
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/tokens');

// Reads "Authorization: Bearer <token>" and sets req.user = { id, role }.
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(ApiError.unauthorized());
  try {
    const payload = verifyToken(token);
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Your session has ended. Log in again.' : 'Log in to continue.';
    return next(ApiError.unauthorized(message));
  }
}

function requireRole(...roles) {
  return (req, res, next) => (roles.includes(req.user?.role) ? next() : next(ApiError.forbidden()));
}

module.exports = { requireAuth, requireRole };
