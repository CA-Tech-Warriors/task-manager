// Owner: A (card A-7). Runs only when DATABASE_URL points at a test database.
const assert = require('node:assert/strict');
const { sequelize } = require('../src/models');

describe('Database', function () {
  before(async function () {
    if (!process.env.DATABASE_URL) this.skip();
    try {
      await sequelize.authenticate();
    } catch {
      this.skip();
    }
  });

  after(() => sequelize.close());

  it('connects', async () => {
    const [rows] = await sequelize.query('SELECT 1 AS ok');
    assert.equal(rows[0].ok, 1);
  });

  it('A-7 has the users, roles and tasks tables');
  it('A-7 deleting a user cascades to their tasks');
});
