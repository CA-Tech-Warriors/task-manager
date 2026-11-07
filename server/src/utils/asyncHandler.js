// Wraps an async controller so a thrown error reaches errorHandler.
// Usage in routes: router.get('/', asyncHandler(controller.list))
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
