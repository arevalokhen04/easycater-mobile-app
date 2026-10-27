export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  joinedAt: string;
  bookings: number;
  totalSpent: number;
}

export interface AdminPackage {
  id: string;
  name: string;
  category: string;
  pricePerHead: number;
  minGuests: number;
  maxGuests: number;
  image: string;
  isActive: boolean;
  isPopular: boolean;
  bookedCount: number;
}

export interface AdminMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface AdminBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export interface AdminPayment {
  id: string;
  referenceNumber: string;
  bookingNumber: string;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  upcomingBookings: number;
  totalCustomers: number;
  activePackages: number;
  activeMenuItems: number;
  revenueTrend: { label: string; revenue: number; bookings: number }[];
  recentBookings: AdminBooking[];
}

export interface SalesReport {
  revenue: number;
  payments: number;
  byMethod: Record<string, number>;
  byPackage: { name: string; category: string; bookings: number; revenue: number }[];
}

export interface TopCustomer {
  name: string;
  email: string;
  bookings: number;
  spend: number;
}
