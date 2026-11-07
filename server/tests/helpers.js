const request = require('supertest');
const app = require('../src/app');
const { signToken } = require('../src/utils/tokens');

// A valid token without touching the database, for testing route guards.
const tokenFor = (role = 'user', id = 1) => signToken({ id, role });

module.exports = { api: () => request(app), tokenFor };
