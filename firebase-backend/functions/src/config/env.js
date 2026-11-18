require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:8100')
    .split(',')
    .map((o) => o.trim()),
  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@easycater.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
  },
};
