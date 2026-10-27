const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Item name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    category: {
      type: String,
      enum: ['appetizer', 'main-course', 'dessert', 'drinks', 'sides'],
      required: true,
    },
    image: { type: String, default: '' },
    dietary: [{ type: String, enum: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'spicy'] }],
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
