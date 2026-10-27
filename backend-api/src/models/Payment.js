const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referenceNumber: { type: String, unique: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
    method: {
      type: String,
      enum: ['gcash', 'maya', 'credit-card', 'bank-transfer', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paidAt: Date,
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.pre('validate', function generateReference(next) {
  if (this.referenceNumber) return next();
  this.referenceNumber = `PAY-${Date.now().toString().slice(-10)}`;
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
