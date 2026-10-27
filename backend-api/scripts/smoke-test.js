/** Boots app.js only (no MongoDB) to smoke-test HTTP wiring. */
const app = require('../src/app');

const server = app.listen(4009, async () => {
  const checks = [
    ['GET', '/api/v1/health'],
    ['GET', '/api/v1/packages'],
    ['GET', '/api/v1/bookings'],
    ['POST', '/api/v1/auth/login'],
    ['GET', '/api/v1/nope'],
  ];

  for (const [method, url] of checks) {
    try {
      const res = await fetch(`http://localhost:4009${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ email: 'a@b.com', password: 'x' }) : undefined,
      });
      const body = (await res.text()).slice(0, 120).replace(/\s+/g, ' ');
      console.log(`${res.status}  ${method.padEnd(4)} ${url.padEnd(26)} ${body}`);
    } catch (err) {
      console.log(`ERR  ${method} ${url} -> ${err.message}`);
    }
  }

  server.close();
  process.exit(0);
});
