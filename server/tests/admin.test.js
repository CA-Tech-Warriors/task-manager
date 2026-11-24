// Owner: D (card D-2). Tests for /api/admin.
//
// The first group swaps the model methods for fakes with the same approach as auth.test.js,
// that way it runs anywhere, including CI, with no database.
// The last test uses a real database to prove the cascade delete, and skips itself without one.
const assert = require('node:assert/strict');
const { api, tokenFor } = require('./helpers');
const { state } = require('../src/db');
const { sequelize, User, Role, Task } = require('../src/models');

const ADMIN_ID = 1;
const adminToken = () => tokenFor('admin', ADMIN_ID);

describe('Admin', () => {
  const restore = [];
  let previousConnected;

  // Replaces object[key] for one test; afterEach puts the original back.
  const stub = (object, key, replacement) => {
    const original = object[key];
    restore.push(() => {
      object[key] = original;
    });
    object[key] = replacement;
  };

  beforeEach(() => {
    previousConnected = state.connected;
    state.connected = true; // admin routes so we can answer 503 without a database
  });

  afterEach(() => {
    while (restore.length) restore.pop()();
    state.connected = previousConnected;
  });

  describe('GET /api/admin/users', () => {
    it('D-2 lists every user with their role and no password hash', async () => {
      stub(User, 'findAll', async () => [
        {
          toJSON: () => ({
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: '$2a$12$should-never-be-sent',
            createdAt: '2026-11-01T00:00:00.000Z',
            Role: { name: 'admin' },
          }),
        },
        {
          toJSON: () => ({
            id: 2,
            username: 'alice',
            email: 'alice@example.com',
            passwordHash: '$2a$12$should-never-be-sent',
            createdAt: '2026-11-02T00:00:00.000Z',
            Role: { name: 'user' },
          }),
        },
      ]);

      const res = await api().get('/api/admin/users').set('Authorization', `Bearer ${adminToken()}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.length, 2);
      assert.equal(res.body[0].role, 'admin');
      assert.equal(res.body[1].role, 'user');
      res.body.forEach((user) => assert.equal(user.passwordHash, undefined));
    });

    it('D-2 answers 403 for a regular user', async () => {
      const res = await api()
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${tokenFor('user', 2)}`);
      assert.equal(res.status, 403);
    });
  });

  describe('GET /api/admin/tasks', () => {
    it("D-2 lists every task with its owner's username", async () => {
      stub(Task, 'findAll', async () => [
        {
          toJSON: () => ({
            id: 7,
            title: 'Deploy API to Render',
            description: '',
            status: 'todo',
            priority: 'high',
            dueDate: '2026-11-14',
            userId: 2,
            createdAt: '2026-11-07T00:00:00.000Z',
            updatedAt: '2026-11-07T00:00:00.000Z',
            User: { username: 'alice' },
          }),
        },
      ]);

      const res = await api().get('/api/admin/tasks').set('Authorization', `Bearer ${adminToken()}`);

      assert.equal(res.status, 200);
      assert.equal(res.body[0].owner, 'alice');
      assert.equal(res.body[0].title, 'Deploy API to Render');
      assert.equal(res.body[0].User, undefined); // the nested object is flattened into owner
    });
  });

  describe('DELETE /api/admin/users/:userId', () => {
    it('D-2 stops an admin deleting their own account', async () => {
      let looked = false;
      stub(User, 'findByPk', async () => {
        looked = true;
        return null;
      });

      const res = await api().delete(`/api/admin/users/${ADMIN_ID}`).set('Authorization', `Bearer ${adminToken()}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.message, "You can't delete your own account.");
      assert.equal(looked, false); // refused before touching the database
    });

    it('D-2 answers 400 when the user ID is not a number', async () => {
      const res = await api().delete('/api/admin/users/abc').set('Authorization', `Bearer ${adminToken()}`);
      assert.equal(res.status, 400);
      assert.ok(res.body.errors.userId);
    });

    it('D-2 answers 404 for a user that does not exist', async () => {
      stub(User, 'findByPk', async () => null);
      const res = await api().delete('/api/admin/users/999').set('Authorization', `Bearer ${adminToken()}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'User not found.');
    });

    it('D-2 deletes another user and answers 204', async () => {
      let destroyed = false;
      stub(User, 'findByPk', async (id) => (id === 2 ? { destroy: async () => (destroyed = true) } : null));

      const res = await api().delete('/api/admin/users/2').set('Authorization', `Bearer ${adminToken()}`);

      assert.equal(res.status, 204);
      assert.equal(destroyed, true);
    });
  });

  describe('PUT /api/admin/users/:userId/role', () => {
    it('D-2 stops an admin changing their own role', async () => {
      let looked = false;
      stub(User, 'findByPk', async () => {
        looked = true;
        return null;
      });

      const res = await api()
        .put(`/api/admin/users/${ADMIN_ID}/role`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ role: 'user' });

      assert.equal(res.status, 400);
      assert.equal(res.body.message, "You can't change your own role.");
      assert.equal(looked, false);
    });

    it('D-2 answers 400 when role is invalid', async () => {
      const res = await api()
        .put('/api/admin/users/2/role')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ role: 'owner' });

      assert.equal(res.status, 400);
      assert.ok(res.body.errors.role);
    });

    it('D-2 answers 404 for a user that does not exist', async () => {
      stub(User, 'findByPk', async () => null);

      const res = await api()
        .put('/api/admin/users/999/role')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ role: 'admin' });

      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'User not found.');
    });

    it('D-2 updates another user role and answers 200 with the updated user', async () => {
      const user = {
        id: 2,
        roleId: 2,
        Role: { name: 'user' },
        update: async ({ roleId }) => {
          user.roleId = roleId;
        },
        reload: async () => {
          user.Role = { name: 'admin' };
        },
        toJSON: () => ({
          id: 2,
          username: 'alice',
          email: 'alice@example.com',
          createdAt: '2026-11-02T00:00:00.000Z',
          Role: user.Role,
        }),
      };

      stub(User, 'findByPk', async (id) => (id === 2 ? user : null));
      stub(Role, 'findOne', async ({ where }) => (where.name === 'admin' ? { id: 1, name: 'admin' } : null));

      const res = await api()
        .put('/api/admin/users/2/role')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ role: 'admin' });

      assert.equal(res.status, 200);
      assert.equal(res.body.id, 2);
      assert.equal(res.body.role, 'admin');
      assert.equal(user.roleId, 1);
    });
  });

  describe('DELETE /api/admin/tasks/:taskId', () => {
    it('D-2 answers 404 for a task that does not exist', async () => {
      stub(Task, 'findByPk', async () => null);
      const res = await api().delete('/api/admin/tasks/999').set('Authorization', `Bearer ${adminToken()}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'Task not found.');
    });

    it('D-2 deletes a task and answers 204', async () => {
      let destroyed = false;
      stub(Task, 'findByPk', async () => ({ destroy: async () => (destroyed = true) }));

      const res = await api().delete('/api/admin/tasks/7').set('Authorization', `Bearer ${adminToken()}`);

      assert.equal(res.status, 204);
      assert.equal(destroyed, true);
    });
  });

  describe('with a real database', function () {
    const tag = Date.now();
    let admin;
    let member;

    before(async function () {
      if (!process.env.DATABASE_URL) return this.skip();
      try {
        await sequelize.authenticate();
        await sequelize.sync(); // creates missing tables; and it never drops data
      } catch {
        return this.skip();
      }
      const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } });
      const [userRole] = await Role.findOrCreate({ where: { name: 'user' } });
      const hash = 'x'.repeat(60); // these test users never log in
      admin = await User.create({
        username: `d2admin${tag}`,
        email: `d2admin${tag}@test.dev`,
        passwordHash: hash,
        roleId: adminRole.id,
      });
      member = await User.create({
        username: `d2member${tag}`,
        email: `d2member${tag}@test.dev`,
        passwordHash: hash,
        roleId: userRole.id,
      });
    });

    // Clean up: Removes only the users this test made (and their tasks go with them).
    after(async () => {
      const ids = [admin?.id, member?.id].filter(Boolean);
      if (ids.length) await User.destroy({ where: { id: ids } });
    });

    it("D-2 deleting a user also deletes that user's tasks", async () => {
      const task = await Task.create({ title: 'D-2 cascade check', userId: member.id });

      const res = await api()
        .delete(`/api/admin/users/${member.id}`)
        .set('Authorization', `Bearer ${tokenFor('admin', admin.id)}`);

      assert.equal(res.status, 204);
      assert.equal(await User.findByPk(member.id), null);
      assert.equal(await Task.findByPk(task.id), null);
    });
  });
});
