// Checks the wiring: routes, guards and error format. Runs without a database.
const assert = require('node:assert/strict');
const { api, tokenFor } = require('./helpers');

describe('Smoke: app wiring', () => {
  it('GET /api/health answers 200', async () => {
    const res = await api().get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  it('protected routes answer 401 without a token', async () => {
    const res = await api().get('/api/tasks');
    assert.equal(res.status, 401);
    assert.ok(res.body.message);
  });

  it('a bad token answers 401', async () => {
    const res = await api().get('/api/tasks').set('Authorization', 'Bearer not-a-token');
    assert.equal(res.status, 401);
  });

  it('admin routes answer 403 for a regular user', async () => {
    const res = await api()
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${tokenFor('user')}`);
    assert.equal(res.status, 403);
  });

  it('validation errors use { message, errors: { field } }', async () => {
    const res = await api().get('/api/tasks?status=nope').set('Authorization', `Bearer ${tokenFor()}`);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.status);
  });

  it('unknown routes answer 404 as JSON', async () => {
    const res = await api().get('/api/nothing-here');
    assert.equal(res.status, 404);
    assert.ok(res.body.message);
  });

  it('invalid JSON answers 400', async () => {
    const res = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
    assert.equal(res.status, 400);
  });

  it('sends security headers (Helmet)', async () => {
    const res = await api().get('/api/health');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
  });
});
