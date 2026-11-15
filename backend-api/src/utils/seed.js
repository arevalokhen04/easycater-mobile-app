/**
 * Seeds demo data for local development.
 *   npm run seed           -> insert packages, menu items, users, bookings
 *   npm run seed:destroy   -> wipe every collection in easycater
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const env = require('../config/env');

const User = require('../models/User');
const Package = require('../models/Package');
const MenuItem = require('../models/MenuItem');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const PACKAGES = [
  {
    name: 'Kusina Classico',
    category: 'wedding',
    description: 'Traditional Filipino entrees served family-style. A timeless choice for weddings and reunions.',
    pricePerHead: 850,
    minGuests: 50,
    maxGuests: 400,
    isPopular: true,
    rating: 4.8,
    image: '/images/pkg-kusina-classico.jpg',
    inclusions: ['4 main courses', '2 appetizers', 'Rice & soup', 'Service crew', 'Tables & chairs'],
  },
  {
    name: 'Modern Fusion',
    category: 'corporate',
    description: 'Contemporary Filipino-Asian fusion buffet designed for corporate lunches and product launches.',
    pricePerHead: 1200,
    minGuests: 20,
    maxGuests: 300,
    isPopular: true,
    rating: 4.6,
    image: '/images/pkg-modern-fusion.jpg',
    inclusions: ['6 main courses', '3 appetizers', 'Dessert station', 'Live carving station', 'Barista cart'],
  },
  {
    name: 'Merienda Plated',
    category: 'birthday',
    description: 'Heavy merienda spread perfect for birthdays, baptisms and graduation parties.',
    pricePerHead: 550,
    minGuests: 15,
    maxGuests: 150,
    rating: 4.4,
    image: '/images/pkg-merienda-plated.jpg',
    inclusions: ['Pasta station', 'Chicken station', 'Ginatang station', 'Dessert table', 'Steaming'],
  },
  {
    name: 'Executive Boardroom',
    category: 'corporate',
    description: 'Upscale plated set menu for boardrooms, formal dinners and intimate board meetings.',
    pricePerHead: 2100,
    minGuests: 8,
    maxGuests: 80,
    rating: 4.9,
    image: '/images/pkg-executive-boardroom.jpg',
    inclusions: ['Appetizer plate', 'Main plate choice', 'Dessert plate', 'Wine pairing', 'Uniformed servers'],
  },
  {
    name: 'Fiesta Grill',
    category: 'other',
    description: 'Live grilling station where chefs cook your chosen premium cuts live in front of guests.',
    pricePerHead: 1450,
    minGuests: 30,
    maxGuests: 350,
    rating: 4.7,
    image: '/images/pkg-fiesta-grill.jpg',
    inclusions: ['Live grill station', '4 grill selections', 'Sides', 'Dessert', 'Grill chef'],
  },
];

// Accurate dish photos from Wikimedia Commons (verified working URLs).
const MENU_ITEM_IMAGES = {
  'Kare-Kare': '/images/menu-kare-kare.jpg',
  'Lechon Kawali': '/images/menu-lechon-kawali.jpg',
  'Lumpiang Shanghai': '/images/menu-lumpiang-shanghai.jpg',
  'Pancit Bihon': '/images/menu-pancit-bihon.jpg',
  'Salmon Teriyaki': '/images/menu-salmon-teriyaki.jpg',
  'Beef Caldereta': '/images/menu-beef-caldereta.jpg',
  'Bihon Guisado': '/images/menu-bihon-guisado.jpg',
  'Cheese Platter': '/images/menu-cheese-platter.jpg',
  'Fresh Mango Juice': '/images/menu-fresh-mango-juice.jpg',
  'Garlic Butter Shrimp': '/images/menu-garlic-butter-shrimp.jpg',
  'Halo-Halo': '/images/menu-halo-halo.jpg',
  'Leche Flan': '/images/menu-leche-flan.jpg',
  'Mung Bean Soup': '/images/menu-mung-bean-soup.jpg',
  'Pochero': '/images/menu-pochero.jpg',
  'Sago't Gulaman': '/images/menu-sago-t-gulaman.jpg',
};

const MENU_ITEMS = [
  ['Kare-Kare', 'Oxtail and peanut stew, perfect with rice', 385, 'main-course', ['halal']],
  ['Pancit Bihon', 'Stir-fried rice noodles with vegetables', 210, 'main-course', ['vegetarian']],
  ['Lechon Kawali', 'Crispy pork belly with liver sauce', 340, 'appetizer', []],
  ['Lumpiang Shanghai', 'Fresh spring rolls with sweet chili sauce', 180, 'appetizer', ['vegetarian']],
  ['Salmon Teriyaki', 'Grilled salmon glazed in teriyaki sauce', 480, 'main-course', ['gluten-free']],
  ['Beef Caldereta', 'Beef stew in a rich tomato-pepper sauce', 395, 'main-course', []],
  ['Pochero', 'Beef, pork and chicken in a sweet tomato sauce', 430, 'main-course', []],
  ['Halo-Halo', 'Shredded ice dessert with fruits and leche flan', 195, 'dessert', ['vegetarian']],
  ['Leche Flan', 'Classic caramel custard', 150, 'dessert', ['vegetarian', 'gluten-free']],
  ['Fresh Mango Juice', 'Freshly squeezed sweet mango', 120, 'drinks', ['vegan', 'gluten-free']],
  ["Sago't Gulaman", 'Gulaman drink with sago pearls', 95, 'drinks', ['vegan']],
  ['Garlic Butter Shrimp', 'Shrimp sautéed in garlic butter', 460, 'main-course', []],
  ['Bihon Guisado', 'Pan-fried vermicelli with meat and vegetables', 250, 'sides', []],
  ['Mung Bean Soup', 'Hot mung bean soup', 110, 'sides', ['vegan', 'gluten-free']],
  ['Cheese Platter', 'Assorted aged cheeses with crackers', 380, 'appetizer', ['vegetarian']],
];

async function destroy() {
  await Promise.all([
    User.deleteMany({}),
    Package.deleteMany({}),
    MenuItem.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('[seed] all collections cleared');
}

async function seed() {
  await destroy();

  const admin = await User.create({
    name: 'EasyCater Admin',
    email: env.seedAdmin.email,
    password: env.seedAdmin.password,
    role: 'admin',
    phone: '+63 917 000 0000',
  });

  const customers = await User.create([
    {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: 'Password123',
      role: 'customer',
      phone: '+63 917 111 1111',
      address: 'Quezon City, Manila',
    },
    {
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      password: 'Password123',
      role: 'customer',
      phone: '+63 917 222 2222',
      address: 'Makati City, Manila',
    },
  ]);

  const packages = await Package.insertMany(PACKAGES.map((p) => ({ ...p, createdBy: admin._id })));

  const menuDocs = MENU_ITEMS.map(([name, description, price, category, dietary], i) => ({
    name,
    description,
    price,
    category,
    dietary,
    // Accurate dish photos (Wikimedia Commons) - verified working URLs.
    image: MENU_ITEM_IMAGES[name] || '',
    package: packages[i % packages.length]._id,
    isFeatured: i < 5,
  }));
  const menu = await MenuItem.insertMany(menuDocs);

  const statuses = ['pending', 'confirmed', 'preparing', 'in-progress', 'completed'];
  const bookings = await Booking.create(
    customers.flatMap((customer) =>
      [0, 1, 2].map((idx) => {
        const pkg = packages[idx];
        const guestCount = Math.max(pkg.minGuests, 50);
        const subtotal = pkg.pricePerHead * guestCount;
        const serviceCharge = Math.round(subtotal * 0.1);
        const tax = Math.round((subtotal + serviceCharge) * 0.12);
        return {
          customer: customer._id,
          package: pkg._id,
          eventType: pkg.category,
          eventDate: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000),
          eventTime: idx % 2 === 0 ? '11:00 AM' : '5:00 PM',
          guestCount,
          venue: 'Grand Ballroom',
          address: 'Quezon City, Manila',
          notes: 'Vegetarian options please.',
          addOns: [{ menuItem: menu[idx]._id, name: menu[idx].name, price: menu[idx].price, quantity: guestCount }],
          subtotal,
          serviceCharge,
          tax,
          total: subtotal + serviceCharge + tax,
          status: statuses[idx],
          paymentStatus: idx >= 2 ? 'paid' : 'unpaid',
        };
      })
    )
  );

  const paidBookings = bookings.filter((b) => b.paymentStatus === 'paid');
  await Payment.insertMany(
    paidBookings.map((b, i) => ({
      booking: b._id,
      user: b.customer,
      amount: Math.round(b.total / 2),
      method: ['gcash', 'maya', 'bank-transfer'][i % 3],
      status: 'paid',
      paidAt: new Date(),
    }))
  );

  await Notification.insertMany(
    customers.flatMap((c) => [
      { user: c._id, title: 'Welcome to EasyCater!', message: 'Your account is ready.', type: 'system' },
      { user: c._id, title: 'Booking confirmed', message: 'Your booking has been confirmed.', type: 'booking', isRead: false },
    ])
  );

  console.log('[seed] done');
  console.log(`[seed] admin login  -> ${env.seedAdmin.email} / ${env.seedAdmin.password}`);
  console.log('[seed] customer     -> maria@example.com / Password123');
}

connectDB()
  .then(async () => {
    if (process.argv.includes('--destroy')) {
      await destroy();
    } else {
      await seed();
    }
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
