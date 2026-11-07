// Builds the Express app (no listening here, so tests can import it).
// Owner: D. Shared file: post in the team chat before changing it.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy; needed for rate limiting by IP
app.use(helmet());
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173'],
    credentials: false,
  }),
);
app.use(express.json({ limit: '100kb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
