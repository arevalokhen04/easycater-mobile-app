// EasyCater backend - Firebase Cloud Functions wrapper
// Wraps the existing Express app and connects to MongoDB Atlas.
const functions = require('firebase-functions');
const mongoose = require('mongoose');

const app = require('./src/app');
const env = require('./src/config/env');

let connPromise = null;
async function ensureDb() {
  if (!connPromise) {
    mongoose.set('strictQuery', true);
    connPromise = mongoose.connect(env.mongoUri);
  }
  return connPromise;
}

exports.api = functions
  .runWith({ memory: '512MB', timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    try {
      await ensureDb();
    } catch (err) {
      res.status(500).json({ success: false, message: 'Database connection failed' });
      return;
    }
    app(req, res);
  });
