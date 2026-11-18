// Deploy prep: copies the backend source + public images into functions/
// so the deployed package contains everything it needs.
// Run from firebase-backend/:  node prepare-deploy.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BACKEND = path.join(ROOT, '..', 'backend-api');
const DEST_SRC = path.join(ROOT, 'functions', 'src');
const DEST_PUBLIC = path.join(ROOT, 'functions', 'public');

function copyDir(from, to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  console.log('copied:', path.relative(ROOT, from), '->', path.relative(ROOT, to));
}

copyDir(path.join(BACKEND, 'src'), DEST_SRC);
copyDir(path.join(BACKEND, 'public'), DEST_PUBLIC);
console.log('Deploy prep done. Now: firebase deploy --only functions,hosting');
