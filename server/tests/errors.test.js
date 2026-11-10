// Owner: D (card D-1). Checks the error format directly, no database needed.
const assert = require('node:assert/strict');
const { UniqueConstraintError, ValidationErrorItem } = require('sequelize');
const config = require('../src/config');
const ApiError = require('../src/utils/ApiError');
const errorHandler = require('../src/middleware/errorHandler');

// A stand-in for Express's res object that records what was sent.
function run(err) {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  errorHandler(err, {}, res, () => {});
  return res;
}

describe('Error format (D-1)', () => {
  let wasProduction;
  beforeEach(() => {
    wasProduction = config.isProduction;
  });
  afterEach(() => {
    config.isProduction = wasProduction;
  });

  it('turns an ApiError into { message, errors } with its status', () => {
    const res = run(ApiError.badRequest('Some of the details need fixing.', { title: 'Give your task a title.' }));
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: 'Some of the details need fixing.', errors: { title: 'Give your task a title.' } });
  });

  it('leaves out errors when there are none', () => {
    const res = run(ApiError.notFound('Task not found.'));
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { message: 'Task not found.' });
  });

  it('turns a duplicate username into 409 with the field', () => {
    const item = new ValidationErrorItem('That username is taken.', 'unique violation', 'username');
    const res = run(new UniqueConstraintError({ errors: [item] }));
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.errors.username, 'That username is taken.');
  });

  it('shows the real message and stack for unknown errors in development', () => {
    config.isProduction = false;
    const res = run(new Error('database exploded'));
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, 'database exploded');
    assert.ok(res.body.stack);
  });

  it('hides the message and stack for unknown errors in production', () => {
    config.isProduction = true;
    const res = run(new Error('database exploded'));
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { message: 'Something went wrong.' });
  });

  it('keeps ApiError messages in production (they are written for people)', () => {
    config.isProduction = true;
    const res = run(ApiError.forbidden());
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.message, "You don't have permission to do that.");
    assert.equal(res.body.stack, undefined);
  });
});
