import {
  AdminBooking,
  AdminMenuItem,
  AdminPackage,
  AdminPayment,
  AdminUser,
} from '../models/admin.models';

/** Fixtures so the admin panel runs before the backend is connected. */

const iso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const MOCK_CUSTOMERS: AdminUser[] = [
  { id: 'c-1', name: 'Maria Santos', email: 'maria@example.com', phone: '+63 917 111 1111', role: 'customer', isActive: true, joinedAt: iso(-240), bookings: 3, totalSpent: 412500 },
  { id: 'c-2', name: 'Juan Dela Cruz', email: 'juan@example.com', phone: '+63 917 222 2222', role: 'customer', isActive: true, joinedAt: iso(-180), bookings: 2, totalSpent: 148000 },
  { id: 'c-3', name: 'Angela Reyes', email: 'angela@example.com', phone: '+63 917 333 3333', role: 'customer', isActive: true, joinedAt: iso(-120), bookings: 5, totalSpent: 726000 },
  { id: 'c-4', name: 'Mark Villanueva', email: 'mark@example.com', phone: '+63 917 444 4444', role: 'customer', isActive: true, joinedAt: iso(-95), bookings: 1, totalSpent: 26000 },
  { id: 'c-5', name: 'Carla Bautista', email: 'carla@example.com', phone: '+63 917 555 5555', role: 'customer', isActive: false, joinedAt: iso(-60), bookings: 0, totalSpent: 0 },
  { id: 'c-6', name: 'Rico Mendoza', email: 'rico@example.com', phone: '+63 917 666 6666', role: 'customer', isActive: true, joinedAt: iso(-30), bookings: 2, totalSpent: 215000 },
];

export const MOCK_PACKAGES: AdminPackage[] = [
  { id: 'p-1', name: 'Kusina Classico', category: 'wedding', pricePerHead: 850, minGuests: 50, maxGuests: 400, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', isActive: true, isPopular: true, bookedCount: 18 },
  { id: 'p-2', name: 'Modern Fusion', category: 'corporate', pricePerHead: 1200, minGuests: 20, maxGuests: 300, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', isActive: true, isPopular: true, bookedCount: 24 },
  { id: 'p-3', name: 'Merienda Plated', category: 'birthday', pricePerHead: 550, minGuests: 15, maxGuests: 150, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', isActive: true, isPopular: false, bookedCount: 31 },
  { id: 'p-4', name: 'Executive Boardroom', category: 'corporate', pricePerHead: 2100, minGuests: 8, maxGuests: 80, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', isActive: true, isPopular: false, bookedCount: 9 },
  { id: 'p-5', name: 'Fiesta Grill', category: 'other', pricePerHead: 1450, minGuests: 30, maxGuests: 350, image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', isActive: true, isPopular: true, bookedCount: 15 },
  { id: 'p-6', name: 'Grand Fiesta Wedding', category: 'wedding', pricePerHead: 1750, minGuests: 80, maxGuests: 500, image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', isActive: true, isPopular: true, bookedCount: 12 },
];

export const MOCK_ADMIN_MENU: AdminMenuItem[] = [
  { id: 'm-1', name: 'Kare-Kare', category: 'main-course', price: 385, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300', isAvailable: true, isFeatured: true },
  { id: 'm-2', name: 'Pancit Bihon', category: 'main-course', price: 210, image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=300', isAvailable: true, isFeatured: false },
  { id: 'm-3', name: 'Lechon Kawali', category: 'appetizer', price: 340, image: 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=300', isAvailable: true, isFeatured: true },
  { id: 'm-4', name: 'Lumpiang Shanghai', category: 'appetizer', price: 180, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300', isAvailable: true, isFeatured: false },
  { id: 'm-5', name: 'Salmon Teriyaki', category: 'main-course', price: 480, image: 'https://images.unsplash.com/photo-1467003909585-2f8a727240d0b?w=300', isAvailable: true, isFeatured: true },
  { id: 'm-6', name: 'Halo-Halo', category: 'dessert', price: 195, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', isAvailable: true, isFeatured: true },
  { id: 'm-7', name: 'Fresh Mango Juice', category: 'drinks', price: 120, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', isAvailable: true, isFeatured: false },
  { id: 'm-8', name: 'Mung Bean Soup', category: 'sides', price: 110, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300', isAvailable: false, isFeatured: false },
];

export const MOCK_ADMIN_BOOKINGS: AdminBooking[] = [
  { id: 'b-1', bookingNumber: 'ECB-48210937', customerName: 'Maria Santos', customerEmail: 'maria@example.com', packageName: 'Grand Fiesta Wedding', eventType: 'wedding', eventDate: iso(45), eventTime: '4:00 PM', guestCount: 180, venue: 'Sapphire Hotel', total: 391500, status: 'confirmed', paymentStatus: 'partial' },
  { id: 'b-2', bookingNumber: 'ECB-39118420', customerName: 'Juan Dela Cruz', customerEmail: 'juan@example.com', packageName: 'Modern Fusion', eventType: 'corporate', eventDate: iso(12), eventTime: '11:00 AM', guestCount: 60, venue: 'TechHub BGC', total: 84240, status: 'preparing', paymentStatus: 'paid' },
  { id: 'b-3', bookingNumber: 'ECB-11402776', customerName: 'Angela Reyes', customerEmail: 'angela@example.com', packageName: 'Merienda Plated', eventType: 'birthday', eventDate: iso(-8), eventTime: '2:00 PM', guestCount: 40, venue: 'QC, Manila', total: 29120, status: 'completed', paymentStatus: 'paid' },
  { id: 'b-4', bookingNumber: 'ECB-66512300', customerName: 'Rico Mendoza', customerEmail: 'rico@example.com', packageName: 'Fiesta Grill', eventType: 'other', eventDate: iso(22), eventTime: '6:00 PM', guestCount: 90, venue: 'Cavite', total: 162400, status: 'pending', paymentStatus: 'unpaid' },
  { id: 'b-5', bookingNumber: 'ECB-77028111', customerName: 'Mark Villanueva', customerEmail: 'mark@example.com', packageName: 'Executive Boardroom', eventType: 'corporate', eventDate: iso(5), eventTime: '12:00 PM', guestCount: 12, venue: 'Makati', total: 30576, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'b-6', bookingNumber: 'ECB-33410022', customerName: 'Angela Reyes', customerEmail: 'angela@example.com', packageName: 'Modern Fusion', eventType: 'corporate', eventDate: iso(-40), eventTime: '7:00 AM', guestCount: 150, venue: 'BGC', total: 210600, status: 'completed', paymentStatus: 'paid' },
  { id: 'b-7', bookingNumber: 'ECB-88230044', customerName: 'Maria Santos', customerEmail: 'maria@example.com', packageName: 'Kusina Classico', eventType: 'wedding', eventDate: iso(65), eventTime: '10:00 AM', guestCount: 220, venue: 'Pampanga', total: 250800, status: 'cancelled', paymentStatus: 'refunded' },
];

/**
 * Days-ago offsets, spread across the six-month window the revenue trend
 * charts. Without this every payment lands in the current month and the
 * dashboard trend renders five empty bars.
 */
const PAYMENT_AGE_DAYS = [2, 33, 66, 99, 132, 165, 190];

const payFor = (booking: AdminBooking, index: number): AdminPayment => ({
  id: `pay-${index}`,
  referenceNumber: `PAY-${900000 + index * 1111}`,
  bookingNumber: booking.bookingNumber,
  customerName: booking.customerName,
  amount: booking.paymentStatus === 'refunded' ? -booking.total : Math.round(booking.total * 0.5),
  method: ['gcash', 'maya', 'bank-transfer', 'credit-card'][index % 4],
  status: booking.paymentStatus === 'refunded' ? 'refunded' : booking.paymentStatus === 'unpaid' ? 'pending' : 'paid',
  paidAt: iso(-(PAYMENT_AGE_DAYS[index] ?? index * 30 + 2)),
});

export const MOCK_ADMIN_PAYMENTS: AdminPayment[] = MOCK_ADMIN_BOOKINGS.map(payFor);
