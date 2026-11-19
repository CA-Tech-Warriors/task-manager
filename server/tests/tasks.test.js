const assert = require('node:assert/strict');
const { api, tokenFor } = require('./helpers');
const { Task } = require('../src/models');

const token = tokenFor('user', 1);

describe('Task C-1', function () {
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
});

describe('Task C-2', function () {
  it('C-2 strips HTML from title and description', async function () {
    const res = await api()
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '<h1> title </h1>', description: ' <p> paragraph </p> ' });

    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'title');
    assert.equal(res.body.description, 'paragraph');
  });
});

describe('Task C-3', function () {
  it('C-3 updates only status when the body has only status', async function () {
    //create initial task that will be edited
    const resCreate = await api().post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'My new task',
      description: 'Complete the API',
      status: 'todo',
      priority: 'high',
    });

    const task = resCreate.body;

    //edit only status of intial task
    const res = await api()
      .put(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'done');
    assert.equal(res.body.title, 'My new task');
    assert.equal(res.body.description, 'Complete the API');
    assert.equal(res.body.priority, 'high');
  });
});

describe('C-4 Tasks', async function () {
  const tasks = await Task.bulkCreate([
    {
      title: 'Finish website',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-12-18',
      createdAt: '2026-10-14T11:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Buy groceries',
      status: 'done',
      priority: 'low',
      dueDate: '2026-11-20',
      createdAt: '2026-11-18T12:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Study React',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2027-02-20',
      createdAt: '2026-10-14T12:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Do the dishes',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-11-30',
      createdAt: '2026-11-18T12:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Clean the car',
      status: 'done',
      priority: 'low',
      dueDate: '2026-11-20',
      createdAt: '2026-11-02T12:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Buy cat food',
      status: 'done',
      priority: 'high',
      dueDate: '2026-11-22',
      createdAt: '2026-11-10T12:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Finish Codecademy project',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2026-12-31',
      createdAt: '2026-11-18T12:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Car registration',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-12-01',
      createdAt: '2026-10-14T08:00:00.000Z',
      userId: 1,
    },
    {
      title: 'Fold laundry',
      status: 'done',
      priority: 'low',
      dueDate: '2026-11-25',
      createdAt: '2026-11-08T12:00:00.000Z',
      userId: 1,
    },
  ]);

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
    assert.deepEqual(dates, [...dates].sort().reverse());
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
  it('returns counts per status', async function () {});
  it('returns tasks due this week', async function () {});
});

describe('Task C-6', function () {
  it("returns 404 for another user's task", async function () {
    const resCreate = await api().post('/api/tasks').set('Authorization', `Bearer ${token}`).send({
      title: 'Private task',
      status: 'todo',
      priority: 'low',
    });

    const task = resCreate.body;

    const otherUserToken = tokenFor('user', 2);

    const res = await api().get(`/api/tasks/${task.id}`).set('Authorization', `Bearer ${otherUserToken}`);

    assert.equal(res.status, 404);
  });
});

describe('Task C-6', function () {
  it('C-6 answers 201 on create and 204 on delete', async function () {
    const resCreate = await api()
      .post(`/api/tasks/`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test task', status: 'todo', priority: 'low' });
    //task to delete
    const task = resCreate.body;

    const resDelete = await api().delete(`/api/tasks/${task.id}`).set('Authorization', `Bearer ${token}`);

    assert.equal(resCreate.status, 201);
    assert.equal(resDelete.status, 204);
  });
});
