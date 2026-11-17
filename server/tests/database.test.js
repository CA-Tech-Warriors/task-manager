// Owner: A (card A-7). Runs only when DATABASE_URL points at a test database.
const assert = require('node:assert/strict');
const { sequelize } = require('../src/models');
const { User, Role, Task } = require('../src/models');

describe('Database', function () {
  before(async function () {
    if (!process.env.DATABASE_URL) this.skip();
    try {
      await sequelize.authenticate();
    } catch {
      this.skip();
    }
  });

 

  it('connects', async () => {
    const [rows] = await sequelize.query('SELECT 1 AS ok');
    assert.equal(rows[0].ok, 1);
  });

  it('Tables exist', async () => {
    const tables = await sequelize.getQueryInterface().showAllTables();
    assert.ok(tables.includes('tasks'), "Expected the 'tasks' table to exist in the database");
    assert.ok(tables.includes('users'), "Expected the 'users' table to exist in the database");
    assert.ok(tables.includes('roles'), "Expected the 'roles' table to exist in the database");
  });

  it('Deleting a user also deletes tasks', async () => {
    const [cascadeTest, cascadeTestCreated] = await User.findOrCreate({
      where: { username: `cascadetest${Date.now()}` },
      defaults: {
        email: `cascadetest${Date.now()}@example.com`,
        passwordHash: 'not-a-real-hash',
        roleId: 1,
      },
    });

    const task = await Task.create({
      title: 'Cascade Test User Task',
      description: 'Hi, I am a test and I have the user role.',
      status: 'in-progress',
      priority: 'high',
      userId: cascadeTest.id,
    });

    //Delete the test user and see if the tasks are gone
    await cascadeTest.destroy();
    const deletedTask = await Task.findByPk(task.id);

    //asser that it's deleted
    assert.equal(deletedTask, null, 'Expected the task to be deleted along with its user');
  });
});
