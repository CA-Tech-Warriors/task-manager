process.env.NODE_ENV = 'test';

require('dotenv').config({
  path: require('path').join(__dirname, '../.env.test'),
  override: true,
});

const { sequelize, state } = require('../src/models');

exports.mochaHooks = {
  beforeAll: async function () {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is missing.');
    }

    const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');

    if (databaseName !== 'task_management_test') {
      throw new Error('Refusing to reset anything other than task_management_test.');
    }

    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    state.connected = true;
  },

  afterAll: async function () {
    await sequelize.close();
  },
};
