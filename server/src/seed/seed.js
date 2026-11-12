// npm run seed: resets and seeds roles, users, and tasks. Owner: A (card A-6).
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { Role, User, Task } = require('../models');

async function seed() {
  await sequelize.authenticate();
  
  //Creates tables if they do not already exist
  await sequelize.sync();
  
  //Check if data already exists 
  const existingAdmin = await User.findOne({ where: { username: 'admin' } });

  if (existingAdmin) {
    console.log("Data already seeded")
    return
  }

  const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } });
  const [userRole]  = await Role.findOrCreate({ where: { name: 'user'  } });

  const adminPasswordHash = await bcrypt.hash('admin123', config.bcryptRounds);
  const alicePasswordHash = await bcrypt.hash('alice123', config.bcryptRounds);

  const [admin, adminCreated] = await User.findOrCreate({
    where: { username: 'admin' },
    defaults: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
    },
  });

  const [alice, aliceCreated] = await User.findOrCreate({
    where: { username: 'alice' },
    defaults: {
      email: 'alice@example.com',
      passwordHash: alicePasswordHash,
      roleId: userRole.id,
    },
  });

  const today = new Date().toISOString().slice(0, 10);

  const adminSampleTasks = [
    {
      title: 'Welcome to the Task Management API',
      description: 'This task was created by the admin during seeding. Admins can delete any task, not just their own.',
      status: 'todo',
      priority: 'high',
      dueDate: today,
      userId: admin.id,
    } ];

    const aliceSampleTasks = [
      {
        title: 'My First User Task',
        description: 'Hi, I am Alice and I have the user role. I can create tasks and edit or delete the ones I own.',
        status: 'in-progress',
        priority: 'high',
        dueDate: today,
        userId: alice.id,
      }
    ];

  if (adminCreated) {
    await Task.bulkCreate(adminSampleTasks);
  }

  if (aliceCreated) {
    await Task.bulkCreate(aliceSampleTasks);
  }

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
