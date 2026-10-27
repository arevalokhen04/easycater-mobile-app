export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'promo' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface OrderTotals {
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
}
