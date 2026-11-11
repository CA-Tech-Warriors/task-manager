// Owner: B (card B-8)
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op, UniqueConstraintError, ValidationError, ValidationErrorItem } = require('sequelize');
const { api, tokenFor } = require('./helpers');
const config = require('../src/config');
const { state } = require('../src/db');
const { User, Role } = require('../src/models');

function makeValidationError(path, message) {
  return new ValidationError('Validation error', [new ValidationErrorItem(message, 'Validation error', path)]);
}

describe('Auth', () => {
  const restore = [];
  let previousConnected;
  let previousProduction;

  const stub = (object, key, replacement) => {
    const original = object[key];
    restore.push(() => {
      object[key] = original;
    });
    object[key] = replacement;
  };

  beforeEach(() => {
    previousConnected = state.connected;
    previousProduction = config.isProduction;
  });

  afterEach(() => {
    while (restore.length) restore.pop()();
    state.connected = previousConnected;
    config.isProduction = previousProduction;
  });

  it('B-1 stores only a bcrypt hash, never the plain password', async () => {
    state.connected = true;

    const plainPassword = 'ValidPass1';
    let createdPayload;

    stub(Role, 'findOne', async () => ({ id: 2 }));
    stub(User, 'create', async (payload) => {
      createdPayload = payload;
      return { id: 15 };
    });
    stub(User, 'findByPk', async () => ({
      toJSON: () => ({
        id: 15,
        username: 'alice',
        email: 'alice@example.com',
        Role: { name: 'user' },
        createdAt: '2026-11-01T00:00:00.000Z',
      }),
    }));

    const res = await api().post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: plainPassword,
    });

    assert.equal(res.status, 201);
    assert.ok(createdPayload);
    assert.notEqual(createdPayload.passwordHash, plainPassword);
    assert.equal(await bcrypt.compare(plainPassword, createdPayload.passwordHash), true);
    assert.equal(res.body.user.passwordHash, undefined);
  });

  it('B-2 rejects a missing username, a bad email or a weak password with 400 and field errors', async () => {
    state.connected = true;

    const missingUsername = await api().post('/api/auth/register').send({
      email: 'valid@example.com',
      password: 'ValidPass1',
    });
    assert.equal(missingUsername.status, 400);
    assert.ok(missingUsername.body.errors.username);

    stub(Role, 'findOne', async () => ({ id: 2 }));
    stub(User, 'create', async () => {
      throw makeValidationError('email', 'Enter a valid email address.');
    });
    const badEmail = await api().post('/api/auth/register').send({
      username: 'alice',
      email: 'not-an-email',
      password: 'ValidPass1',
    });
    assert.equal(badEmail.status, 400);
    assert.equal(badEmail.body.errors.email, 'Enter a valid email address.');

    stub(User, 'create', async () => {
      throw makeValidationError('password', 'Password must be 8+ characters with a letter and a number.');
    });
    const weakPassword = await api().post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'weak',
    });
    assert.equal(weakPassword.status, 400);
    assert.equal(weakPassword.body.errors.password, 'Password must be 8+ characters with a letter and a number.');
  });

  it('B-2 rejects a username or email that is already taken with 409', async () => {
    state.connected = true;

    stub(Role, 'findOne', async () => ({ id: 2 }));
    stub(User, 'create', async () => {
      const usernameError = new ValidationErrorItem('That username is taken.', 'unique violation', 'username');
      const emailError = new ValidationErrorItem('An account with that email already exists.', 'unique violation', 'email');
      throw new UniqueConstraintError({ errors: [usernameError, emailError] });
    });

    const res = await api().post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'ValidPass1',
    });

    assert.equal(res.status, 409);
    assert.equal(res.body.errors.username, 'That username is taken.');
    assert.equal(res.body.errors.email, 'An account with that email already exists.');
  });

  it('B-3 logs in with a username or an email', async () => {
    state.connected = true;

    const account = {
      id: 23,
      passwordHash: await bcrypt.hash('ValidPass1', 10),
      toJSON() {
        return {
          id: 23,
          username: 'alice',
          email: 'alice@example.com',
          createdAt: '2026-11-01T00:00:00.000Z',
          Role: { name: 'user' },
        };
      },
    };

    const seenUsernames = [];
    stub(User, 'scope', () => ({
      findOne: async ({ where }) => {
        seenUsernames.push(where[Op.or][0].username);
        return account;
      },
    }));

    const byUsername = await api().post('/api/auth/login').send({ username: 'alice', password: 'ValidPass1' });
    assert.equal(byUsername.status, 200);
    assert.ok(byUsername.body.token);

    const byEmail = await api().post('/api/auth/login').send({ username: 'alice@example.com', password: 'ValidPass1' });
    assert.equal(byEmail.status, 200);
    assert.ok(byEmail.body.token);

    assert.deepEqual(seenUsernames, ['alice', 'alice@example.com']);
  });

  it('B-3 answers 401 with one generic message for a wrong password', async () => {
    state.connected = true;

    const account = {
      id: 41,
      passwordHash: await bcrypt.hash('CorrectPass1', 10),
      toJSON() {
        return {
          id: 41,
          username: 'alice',
          email: 'alice@example.com',
          createdAt: '2026-11-01T00:00:00.000Z',
          Role: { name: 'user' },
        };
      },
    };

    stub(User, 'scope', () => ({
      findOne: async () => account,
    }));

    const res = await api().post('/api/auth/login').send({ username: 'alice', password: 'WrongPass1' });
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Invalid username or password.');
  });

  it('B-4 rejects an expired token with 401', async () => {
    const expired = jwt.sign({ sub: '9', role: 'user' }, config.jwtSecret, { expiresIn: -1 });

    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Your session has ended. Log in again.');
  });

  it('B-5 answers 429 after too many login attempts', async () => {
    config.isProduction = true;
    const ip = `10.0.0.${Math.floor(Math.random() * 200) + 1}`;

    let lastResponse;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      lastResponse = await api().post('/api/auth/login').set('X-Forwarded-For', ip).send({});
    }

    assert.equal(lastResponse.status, 429);
    assert.equal(lastResponse.body.message, 'Too many attempts. Wait 15 minutes, then try again.');
  });

  it('B-7 updates username and email', async () => {
    state.connected = true;

    const record = {
      id: 55,
      username: 'before',
      email: 'before@example.com',
      createdAt: '2026-11-01T00:00:00.000Z',
      roleName: 'user',
    };
    let seenUpdate;

    const account = {
      async update(payload) {
        seenUpdate = payload;
        record.username = payload.username;
        record.email = payload.email;
      },
      async reload() {},
      toJSON() {
        return {
          id: record.id,
          username: record.username,
          email: record.email,
          createdAt: record.createdAt,
          Role: { name: record.roleName },
        };
      },
    };

    stub(User, 'findByPk', async () => account);

    const res = await api()
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${tokenFor('user', 55)}`)
      .send({ username: '  after  ', email: '  after@example.com  ' });

    assert.equal(res.status, 200);
    assert.deepEqual(seenUpdate, { username: 'after', email: 'after@example.com' });
    assert.equal(res.body.user.username, 'after');
    assert.equal(res.body.user.email, 'after@example.com');
  });

  it('B-7 changes the password only when the current one is right', async () => {
    state.connected = true;

    const oldPassword = 'OldPass1';
    const initialHash = await bcrypt.hash(oldPassword, 10);
    let updates = 0;
    let latestPasswordHash = initialHash;

    const account = {
      passwordHash: initialHash,
      async update(payload) {
        updates += 1;
        latestPasswordHash = payload.passwordHash;
        this.passwordHash = payload.passwordHash;
      },
    };

    stub(User, 'scope', () => ({
      findByPk: async () => account,
    }));

    const wrongCurrent = await api()
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${tokenFor('user', 77)}`)
      .send({ currentPassword: 'WrongPass1', newPassword: 'NewPass2' });

    assert.equal(wrongCurrent.status, 400);
    assert.equal(wrongCurrent.body.errors.currentPassword, 'Current password is incorrect.');
    assert.equal(updates, 0);

    const correctCurrent = await api()
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${tokenFor('user', 77)}`)
      .send({ currentPassword: oldPassword, newPassword: 'NewPass2' });

    assert.equal(correctCurrent.status, 200);
    assert.equal(correctCurrent.body.message, 'Password updated.');
    assert.equal(updates, 1);
    assert.equal(await bcrypt.compare('NewPass2', latestPasswordHash), true);
    assert.notEqual(latestPasswordHash, initialHash);
  });
});
