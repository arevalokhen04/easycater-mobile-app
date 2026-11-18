const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Package name is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: '' },
    pricePerHead: { type: Number, required: [true, 'pricePerHead is required'], min: 0 },
    minGuests: { type: Number, default: 20, min: 1 },
    maxGuests: { type: Number, default: 500, min: 1 },
    category: {
      type: String,
      enum: ['wedding', 'corporate', 'birthday', 'christening', 'graduation', 'other'],
      default: 'other',
    },
    image: { type: String, default: '' },
    images: [{ type: String }],
    inclusions: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Derive the slug from the name so any write path (controller, seed, script) stays valid
packageSchema.pre('validate', function generateSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('Package', packageSchema);
