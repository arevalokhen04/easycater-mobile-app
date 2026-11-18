const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[db] connected -> ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[db] connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
