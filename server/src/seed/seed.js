// npm run seed: resets and seeds roles, users, and tasks. Owner: A (card A-6).
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { Role, User, Task } = require('../models');

async function seed() {
  await sequelize.authenticate();
  // Drop and recreate tables from Sequelize models.
  await sequelize.sync({ force: true });

  const [adminRole, userRole] = await Promise.all([Role.create({ name: 'admin' }), Role.create({ name: 'user' })]);

  const adminPasswordHash = await bcrypt.hash('admin123', config.bcryptRounds);
  const alicePasswordHash = await bcrypt.hash('alice123', config.bcryptRounds);

  const admin = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: adminPasswordHash,
    roleId: adminRole.id,
  });

  const alice = await User.create({
    username: 'alice',
    email: 'alice@example.com',
    passwordHash: alicePasswordHash,
    roleId: userRole.id,
  });

  const today = new Date().toISOString().slice(0, 10);

  const sampleTasks = [
    {
      title: 'Welcome to the Task Management API',
      description: 'This task was created by the admin during seeding. Admins can delete any task, not just their own.',
      status: 'todo',
      priority: 'high',
      dueDate: today,
      userId: admin.id,
    },
    {
      title: 'My First User Task',
      description: 'Hi, I am Alice and I have the user role. I can create tasks and edit or delete the ones I own.',
      status: 'in-progress',
      priority: 'high',
      dueDate: today,
      userId: alice.id,
    },
  ];

  await Task.bulkCreate(sampleTasks);

  const roleCount = await Role.count();
  const userCount = await User.count();
  const taskCount = await Task.count();

  console.log(`Created ${roleCount} roles`);
  console.log(`Created ${userCount} users`);
  console.log(`Created ${taskCount} tasks`);

  console.log('Seed complete');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
