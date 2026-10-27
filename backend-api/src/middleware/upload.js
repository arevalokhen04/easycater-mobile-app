const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPG, PNG, WEBP or GIF images are allowed'));
    }
    cb(null, true);
  },
});

module.exports = upload;
