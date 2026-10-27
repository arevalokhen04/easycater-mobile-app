export type PaymentMethod = 'gcash' | 'maya' | 'credit-card' | 'bank-transfer' | 'cash';

export interface Payment {
  id: string;
  bookingId: string;
  referenceNumber: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
}
