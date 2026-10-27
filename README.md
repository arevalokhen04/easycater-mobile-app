# EasyCater

A catering booking platform split into three independently runnable parts.

```
EasyCater/
├── mobile-app/    Ionic + Angular customer app      (port 8100)
├── admin-panel/   Ionic + Angular staff dashboard   (port 8101)
└── backend-api/   Node + Express + MongoDB REST API (port 4000)
```

Both front ends run on fixtures by default, so the UI is fully explorable before the
API is switched on. `ApiService` and the token interceptor are already in place, so
moving to real HTTP is a one-flag change (see [Wiring the API](#wiring-the-api)).

---

## Prerequisites

- Node.js 20+ (verified on 24)
- MongoDB — only needed by `backend-api`
- Ionic CLI: `npm install -g @ionic/cli` (or use `npx @ionic/cli`)

---

## Quick start

```bash
# 1. API
cd backend-api
npm install
copy .env.example .env        # macOS/Linux: cp .env.example .env
npm run seed                 # optional demo data (needs MongoDB running)
npm run dev                  # http://localhost:4000

# 2. Mobile app
cd ../mobile-app
npm install
npx @ionic/cli serve         # http://localhost:8100

# 3. Admin panel
cd ../admin-panel
npm install
npx @ionic/cli serve --port 8101
```

Each app has its own `node_modules` and dev server, so run the commands in three
separate terminals.

---

## `mobile-app` — customer app

Ionic tabs shell. Five tabs, plus four full-screen routes stacked above them for the
booking flow.

| Route           | Screen        | Notes                                        |
| --------------- | ------------- | -------------------------------------------- |
| `/login`        | Login         | Public. Demo buttons fill the form.          |
| `/register`     | Register      | Public.                                       |
| `/tabs/home`    | Home          | Hero, popular packages, upcoming bookings.   |
| `/tabs/packages`| Packages      | Filter by category, search.                  |
| `/tabs/menu`    | Menu          | Filter by course and dietary tag.            |
| `/tabs/bookings`| My Bookings   | Status timeline per booking.                 |
| `/tabs/profile` | Profile       | Account details, sign out.                   |
| `/package-details/:id` | Package Details | Add-ons, guest count picker.           |
| `/booking`      | Booking       | Date, time, venue, notes.                    |
| `/cart`         | Cart          | Order summary with the running total.        |
| `/payment`      | Payment       | GCash / Maya / bank transfer.                |

```
src/app/
├── core/
│   ├── data/mock-data.ts     all fixtures
│   ├── guards/               auth.guard
│   ├── interceptors/         token.interceptor
│   ├── models/               package, menu-item, booking, payment, user, notification
│   └── services/             auth, api, package, menu, booking, payment, cart, notification
├── login/ register/ home/ packages/ package-details/ menu/
├── booking/ cart/ payment/ my-bookings/ profile/
└── tabs/                     tab shell + child routes
```

`CartService` holds the order draft across Package Details → Booking → Cart → Payment,
including add-ons and event details.

Totals match the backend formula: 10% service charge, then 12% VAT on the subtotal
plus service charge.

## `admin-panel` — staff dashboard

Separate Ionic app, desktop layout (sidenav + split pane).

| Screen      | Highlights                                             |
| ----------- | ------------------------------------------------------ |
| Dashboard   | Revenue, bookings, customers, recent orders, chart.    |
| Packages    | Full CRUD, publish toggle, image upload.               |
| Menu        | Full CRUD by course, dietary tags, availability.       |
| Bookings    | Status pipeline, advance/cancel, detail drawer.        |
| Payments    | Filter by method and status, refund.                   |
| Customers   | Search, order history per customer.                    |
| Reports     | Sales over time, top packages, booking mix.            |

```
src/app/
├── core/
│   ├── data/mock-admin-data.ts   fixtures
│   ├── services/                 admin-data, auth, api
│   ├── guards/ interceptors/ models/
├── admin-shell/                  sidenav + outlet
└── dashboard/ packages/ menu/ bookings/ payments/ customers/ reports/
```

`AdminDataService` is an in-memory store, so creates and status changes persist while
the app is running.

---

## `backend-api`

```
src/
├── config/       env validation + mongoose connection
├── models/       User, Package, MenuItem, Booking, Payment, Notification
├── controllers/  auth, user, package, menu, booking, payment, notification, dashboard, report
├── middleware/   auth (JWT), admin (role), upload (multer), notFound, errorHandler
├── routes/       mounted under /api/v1
└── utils/        ApiError, jwt, asyncHandler, slugify
```

Every response uses one envelope:

```json
{ "success": true, "data": {}, "meta": {} }
{ "success": false, "message": "..." }
```

Protected routes expect `Authorization: Bearer <token>`. Full endpoint list is in
[`backend-api/README.md`](backend-api/README.md).

### Seeded accounts

| Role     | Email               | Password    |
| -------- | ------------------- | ----------- |
| Admin    | admin@easycater.com | `Admin123!` |
| Customer | maria@example.com   | `Password123` |

### Scripts

| Script                 | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start with nodemon reload                           |
| `npm start`            | Start once                                          |
| `npm run seed`         | Wipe and reload demo data                           |
| `npm run seed:destroy` | Clear all collections                               |
| `npm run smoke`        | Check HTTP wiring — no database needed              |
| `npm run seed:validate` | Validate seed fixtures against schemas — no DB     |

---

## Wiring the API

Both apps ship with `useMockData: true`. To talk to the backend:

1. Start `backend-api` on port 4000 and confirm `http://localhost:4000/api/v1/health`.
2. In `mobile-app/src/environments/environment.ts` **and**
   `admin-panel/src/environments/environment.ts`, set `useMockData: false`.
3. Restart the dev server.

`apiUrl` already points at `http://localhost:4000/api/v1`. Sign in with a seeded
account to get a real JWT — the token interceptor attaches it automatically.

`CORS_ORIGIN` in `backend-api/.env` must list whichever ports you serve the front ends
from; the default already covers 8100, 8101 and 4200.

---

## Notes

- Angular 22 is zoneless, so there is no `zone.js` polyfill.
- Shared layout classes live in `global.scss` to stay under Angular's 4 kB
  per-component style budget.
- `capacitor.config.ts` exists in both apps; add platforms with
  `npx cap add android` when you are ready for native builds.
- `npx ng build` succeeds in both front ends. The "browsers outside Angular's support"
  warning comes from the generated `.browserslistrc` and is harmless.
