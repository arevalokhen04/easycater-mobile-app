const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    eventType: {
      type: String,
      enum: ['wedding', 'corporate', 'birthday', 'christening', 'graduation', 'other'],
      default: 'other',
    },
    eventDate: { type: Date, required: [true, 'Event date is required'] },
    eventTime: { type: String, required: true },
    guestCount: { type: Number, required: true, min: 1 },
    venue: { type: String, trim: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true, default: '' },
    addOns: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

// Auto-generate booking number before first save
bookingSchema.pre('validate', function generateBookingNumber(next) {
  if (this.bookingNumber) return next();
  const stamp = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 900 + 100);
  this.bookingNumber = `ECB-${stamp}-${rand}`;
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
