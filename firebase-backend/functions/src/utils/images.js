const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../../public/images');

const slugifyName = (text) =>
  String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Serves stored /images/... paths as absolute URLs for the requesting client. */
const absoluteUrl = (req, image) => {
  if (!image) return image;
  if (image.startsWith('/images/')) {
    return `${req.protocol}://${req.get('host')}${image}`;
  }
  return image;
};

/** Saves a base64 data URL image into public/images and returns its path. */
const saveDataImage = (prefix, dataUrl) => {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/.exec(dataUrl);
  if (!match) return dataUrl;
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const file = `${prefix}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(IMAGES_DIR, file), Buffer.from(match[2], 'base64'));
  return `/images/${file}`;
};

module.exports = { slugifyName, absoluteUrl, saveDataImage };
