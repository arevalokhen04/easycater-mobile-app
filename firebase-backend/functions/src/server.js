const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(`[server] EasyCater API listening on http://localhost:${env.port}`);
    console.log(`[server] Health check: http://localhost:${env.port}/api/v1/health`);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection:', reason);
  process.exit(1);
});
