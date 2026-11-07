// Reads every environment variable in one place. Owner: D (B for the JWT values).
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const config = {
  env,
  isProduction,
  isTest: env === 'test',
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL || '',
  postgresSsl: process.env.POSTGRES_SSL === 'true',
  jwtSecret: process.env.JWT_SECRET || (isProduction ? '' : 'dev-only-secret-do-not-use-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  bcryptRounds: Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 12),
};

if (isProduction && (!config.jwtSecret || !config.databaseUrl)) {
  throw new Error('JWT_SECRET and DATABASE_URL must be set in production.');
}

module.exports = config;
