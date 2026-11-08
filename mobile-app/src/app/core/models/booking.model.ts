export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface BookingAddOn {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  packageId: string;
  packageName?: string;
  packageImage?: string;
  /** Populated for admins (GET /bookings returns all customers' bookings). */
  customerName?: string;
  customerEmail?: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  address: string;
  notes?: string;
  addOns: BookingAddOn[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  /** Running sum of confirmed payments - mirrors the backend aggregation. */
  amountPaid?: number;
  createdAt?: string;
}
