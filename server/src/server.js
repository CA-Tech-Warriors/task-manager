// Starts the server: connects to the database, then listens.
const app = require('./app');
const config = require('./config');
const { sequelize, state } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    // TODO A-2: switch to migrations if the team wants them; sync is fine for this project.
    await sequelize.sync();
    state.connected = true;
    console.log('Database connected');
  } catch (err) {
    if (config.isProduction) {
      console.error('Database connection failed:', err.message);
      process.exit(1);
    }
    console.warn(`Database not connected (${err.message}). Routes that need it will return 503.`);
  }

  const server = app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use. Stop the other server, or set PORT in server/.env.`);
      process.exit(1);
    }
    throw err;
  });
}

start();
