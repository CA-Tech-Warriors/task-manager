// npm run seed: creates the starter roles and accounts. Owner: A (card A-6).
// Must be safe to run more than once (use findOrCreate).
const { sequelize } = require('../models');
// const bcrypt = require('bcryptjs');
// const config = require('../config');
// const { Role, User, Task } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  // TODO A-6:
  // 1. Roles "admin" and "user"
  // 2. admin / admin123 (role admin), alice / alice123 (role user), passwords hashed with config.bcryptRounds
  // 3. A few sample tasks for alice

  console.log('Seed complete');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
