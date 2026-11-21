const assert = require('node:assert/strict');
const { api, tokenFor } = require('./helpers');
const { Task } = require('../src/models');
const { state } = require('../src/db');
const { Op } = require('sequelize');

const restore = [];
let previousConnected;

const stub = (object, key, replacement) => {
  const original = object[key];

  restore.push(() => {
    object[key] = original;
  });

  object[key] = replacement;
};

const token = tokenFor('user', 1);

describe('Tasks', function () {
  beforeEach(() => {
    previousConnected = state.connected;
    state.connected = true;
  });

  afterEach(() => {
    while (restore.length) {
      restore.pop()();
    }

    state.connected = previousConnected;
  });

  it('C-1 rejects a missing title, bad status, bad priority or bad date with 400', async function () {
    const invalidTasks = [
      { status: 'todo', priority: 'low' },
      { title: 'Test task', status: 'invalid-status', priority: 'low' },
      { title: 'Test task', status: 'todo', priority: 'invalid-priority' },
      { title: 'Test task', status: 'todo', priority: 'low', dueDate: 'not-a-date' },
    ];

    for (const task of invalidTasks) {
      const res = await api().post('/api/tasks').set('Authorization', `Bearer ${token}`).send(task);

      assert.equal(res.status, 400);
    }
  });

  it('C-2 strips HTML from title and description', async function () {
    stub(Task, 'create', async (data) => ({
      id: 1,
      ...data,
    }));

    const res = await api()
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '<h1> title </h1>', description: ' <p> paragraph </p> ' });

    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'title');
    assert.equal(res.body.description, 'paragraph');
  });

  it('C-3 updates only status when the body has only status', async function () {
    const fakeTask = {
      id: 1,
      userId: 1,
      title: 'Original title',
      description: 'Original description',
      status: 'todo',
      priority: 'medium',
      dueDate: null,

      update: async function (data) {
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) {
            this[key] = value;
          }
        }

        return this;
      },
    };

    stub(Task, 'create', async (data) => ({
      id: 1,
      ...data,
    }));

    stub(Task, 'findByPk', async () => fakeTask);

    const createRes = await api().post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'Original title',
      description: 'Original description',
      status: 'todo',
      priority: 'medium',
    });

    assert.equal(createRes.status, 201);

    const res = await api()
      .put(`/api/tasks/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Original title');
    assert.equal(res.body.description, 'Original description');
    assert.equal(res.body.status, 'done');
    assert.equal(res.body.priority, 'medium');
  });

  describe('C-4 Tasks', function () {
    const tasks = [
      {
        id: 1,
        title: 'Finish website',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-12-18',
        createdAt: '2026-10-14T11:00:00.000Z',
        userId: 1,
      },
      {
        id: 2,
        title: 'Buy groceries',
        status: 'done',
        priority: 'low',
        dueDate: '2026-11-20',
        createdAt: '2026-11-18T12:00:00.000Z',
        userId: 1,
      },
      {
        id: 3,
        title: 'Study React',
        status: 'in-progress',
        priority: 'medium',
        dueDate: '2027-02-20',
        createdAt: '2026-10-14T12:00:00.000Z',
        userId: 1,
      },
      {
        id: 4,
        title: 'Do the dishes',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-11-30',
        createdAt: '2026-11-18T12:00:00.000Z',
        userId: 1,
      },
      {
        id: 5,
        title: 'Clean the car',
        status: 'done',
        priority: 'low',
        dueDate: '2026-11-20',
        createdAt: '2026-11-02T12:00:00.000Z',
        userId: 1,
      },
      {
        id: 6,
        title: 'Buy cat food',
        status: 'done',
        priority: 'high',
        dueDate: '2026-11-22',
        createdAt: '2026-11-10T12:00:00.000Z',
        userId: 1,
      },
      {
        id: 7,
        title: 'Finish Codecademy project',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2026-12-31',
        createdAt: '2026-11-18T12:00:00.000Z',
        userId: 1,
      },
      {
        id: 8,
        title: 'Car registration',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-12-01',
        createdAt: '2026-10-14T08:00:00.000Z',
        userId: 1,
      },
      {
        id: 9,
        title: 'Fold laundry',
        status: 'done',
        priority: 'low',
        dueDate: '2026-11-25',
        createdAt: '2026-11-08T12:00:00.000Z',
        userId: 1,
      },
    ];

    beforeEach(() => {
      stub(Task, 'findAll', async ({ where, order }) => {
        let results = [...tasks];

        // Filter by user
        results = results.filter((task) => task.userId === where.userId);

        // Filter by status
        if (where.status) {
          results = results.filter((task) => task.status === where.status);
        }

        // Filter by priority
        if (where.priority) {
          results = results.filter((task) => task.priority === where.priority);
        }

        // Search title and description
        if (where[Op.or]) {
          results = results.filter((task) =>
            where[Op.or].some((condition) => {
              const field = Object.keys(condition)[0];
              const search = condition[field][Op.iLike].replaceAll('%', '').toLowerCase();

              return (task[field] || '').toLowerCase().includes(search);
            }),
          );
        }

        // Sorting
        const [sortField, direction] = order[0];

        results.sort((a, b) => {
          const comparison = String(a[sortField] ?? '').localeCompare(String(b[sortField] ?? ''));
          return direction.toLowerCase() === 'desc' ? -comparison : comparison;
        });

        return results;
      });
    });

    it('filters by status', async function () {
      const res = await api().get('/api/tasks?status=todo').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.every((task) => task.status === 'todo'));
    });

    it('filters by priority', async function () {
      const res = await api().get('/api/tasks?priority=high').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.every((task) => task.priority === 'high'));
    });

    it('searches tasks', async function () {
      const res = await api().get('/api/tasks?search=car').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.some((task) => task.title === 'Car registration'));
      assert.ok(res.body.some((task) => task.title === 'Clean the car'));
      assert.ok(res.body.every((task) => task.title.toLowerCase().includes('car')));
    });

    it('sorts tasks by dueDate ascending', async function () {
      const res = await api().get('/api/tasks?sortBy=dueDate&order=asc').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);

      const dates = res.body.map((task) => task.dueDate);
      assert.deepEqual(dates, [...dates].sort());
    });

    it('sorts tasks by dueDate descending', async function () {
      const res = await api().get('/api/tasks?sortBy=dueDate&order=desc').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);

      const dates = res.body.map((task) => task.dueDate);
      const datesWithoutNull = dates.filter((date) => date !== null);

      assert.deepEqual(datesWithoutNull, [...datesWithoutNull].sort().reverse());

      assert.ok(dates.slice(0, datesWithoutNull.length).every((date) => date !== null));
    });

    it('sorts tasks by createdAt ascending', async function () {
      const res = await api().get('/api/tasks?sortBy=createdAt&order=asc').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);

      const dates = res.body.map((task) => new Date(task.createdAt).getTime());
      assert.deepEqual(
        dates,
        [...dates].sort((a, b) => a - b),
      );
    });

    it('sorts tasks by createdAt descending', async function () {
      const res = await api().get('/api/tasks?sortBy=createdAt&order=desc').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);

      const dates = res.body.map((task) => new Date(task.createdAt).getTime());
      assert.deepEqual(
        dates,
        [...dates].sort((a, b) => b - a),
      );
    });
  });

  describe('Task C-5 statistics', function () {
    const token = tokenFor('user', 1);

    beforeEach(() => {
      stub(Task, 'count', async ({ where }) => {
        if (where.status === 'todo') return 3;
        if (where.status === 'in-progress') return 2;
        if (where.status === 'done') return 4;

        if (where.dueDate) return 3;

        return 0;
      });
    });

    it('returns counts per status', async function () {
      const res = await api().get('/api/tasks/stats').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.todo, 3);
      assert.equal(res.body['in-progress'], 2);
      assert.equal(res.body.done, 4);
    });

    it('returns the count of tasks due this week', async function () {
      const res = await api().get('/api/tasks/stats').set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.dueThisWeek, 3);
    });
  });

  it("returns 404 for another user's task", async function () {
    const fakeTask = {
      id: 1,
      userId: 1,
      title: 'Private task',
      status: 'todo',
      priority: 'low',
    };

    stub(Task, 'create', async (data) => ({
      id: 1,
      ...data,
    }));

    stub(Task, 'findByPk', async () => fakeTask);

    const resCreate = await api().post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'Private task',
      status: 'todo',
      priority: 'low',
    });

    assert.equal(resCreate.status, 201);

    const task = resCreate.body;
    const otherUserToken = tokenFor('user', 2);

    const res = await api().get(`/api/tasks/${task.id}`).set('Authorization', `Bearer ${otherUserToken}`);

    assert.equal(res.status, 404);
  });

  it('C-6 answers 201 on create and 204 on delete', async function () {
    const fakeTask = {
      id: 1,
      userId: 1,
      title: 'Test task',
      status: 'todo',
      priority: 'low',

      destroy: async function () {
        this.deleted = true;
      },
    };

    stub(Task, 'create', async (data) => ({
      id: 1,
      ...data,
    }));

    stub(Task, 'findByPk', async () => fakeTask);

    const resCreate = await api()
      .post('/api/tasks/')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test task', status: 'todo', priority: 'low' });

    // Task to delete
    const task = resCreate.body;

    const resDelete = await api().delete(`/api/tasks/${task.id}`).set('Authorization', `Bearer ${token}`);

    assert.equal(resCreate.status, 201);
    assert.equal(resDelete.status, 204);
    assert.equal(fakeTask.deleted, true);
  });
});
