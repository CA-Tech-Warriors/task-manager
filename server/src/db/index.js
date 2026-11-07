// Sequelize connection. Owner: A.
const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.databaseUrl || 'postgres://localhost:5432/task_management', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: config.postgresSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

// Set to true by server.js once the connection works. The health route reports it,
// and requireDatabase() answers 503 while it's false.
const state = { connected: false };

module.exports = { sequelize, state };
