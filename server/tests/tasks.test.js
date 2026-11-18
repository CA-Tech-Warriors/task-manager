const assert = require('node:assert/strict');
const { api, tokenFor } = require('./helpers');

const token = tokenFor('user', 1);

describe('Tasks', function () {
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
    const res = await api()
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '<h1> title </h1>', description: ' <p> paragraph </p> ' });

    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'title');
    assert.equal(res.body.description, 'paragraph');
  });

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

  it('C-4 filters by status, priority and search, and sorts by createdAt or dueDate', async function () {});

  it('C-5 returns counts per status and due this week', async function () {});

  it("C-6 returns 404 for another user's task", async function () {
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
