# EasyCater Backend API

Node + Express + MongoDB REST API backing the EasyCater mobile app and admin panel.

## Setup

Requires a running MongoDB (local `mongodb://127.0.0.1:27017` by default).

```bash
npm install
copy .env.example .env      # Windows (PowerShell: copy .env.example .env)
npm run seed                # optional: load demo data
npm run dev                 # http://localhost:4000
```

Health check: `http://localhost:4000/api/v1/health`

## Scripts

| Script               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Start with nodemon reload                                |
| `npm start`          | Start once                                               |
| `npm run seed`       | Wipe and reload demo data                                |
| `npm run seed:destroy` | Clear all collections                                  |
| `npm run smoke`      | Boot Express without a DB and check route wiring         |
| `npm run seed:validate` | Validate seed fixtures against the schemas, no DB needed |

## Seeded accounts

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@easycater.com   | Admin123!   |
| Customer | maria@example.com     | Password123 |

## Structure

```
src/
├── config/       env + mongoose connection
├── controllers/  one file per resource
├── middleware/   auth, admin, upload, errors
├── models/       Mongoose schemas
├── routes/       v1 route definitions
├── utils/        ApiError, jwt, asyncHandler, slugify, seed
├── app.js        express app
└── server.js     entry point

scripts/
├── smoke-test.js       HTTP wiring check (no database required)
└── seed-validate.js    schema check for the seed fixtures (no database required)
```

## Endpoints

Base URL: `/api/v1`

### Auth
| Method | Path              | Access  |
| ------ | ----------------- | ------- |
| POST   | `/auth/register`  | Public  |
| POST   | `/auth/login`     | Public  |
| GET    | `/auth/me`        | Auth    |
| PUT    | `/auth/password`  | Auth    |

### Users (admin only)
`GET /users` · `GET /users/:id` · `GET /users/:id/bookings` · `PUT /users/:id` · `DELETE /users/:id`

### Packages
`GET /packages` (public) · `GET /packages/:idOrSlug` (public)
`POST /packages` · `PUT /packages/:id` · `DELETE /packages/:id` (admin)

### Menu
`GET /menu` · `GET /menu/categories` · `GET /menu/:id` (public)
`POST /menu` · `PUT /menu/:id` · `DELETE /menu/:id` (admin)

### Bookings
`GET /bookings` · `GET /bookings/:id` · `POST /bookings` · `POST /bookings/quote` · `PATCH /bookings/:id/cancel`
`PUT /bookings/:id/status` (admin)

### Payments
`GET /payments` · `GET /payments/:id` · `POST /payments`
`PUT /payments/:id` (admin)

### Notifications
`GET /notifications` · `GET /notifications/unread-count` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all`
`POST /notifications/broadcast` (admin)

### Dashboard & Reports (admin)
`GET /dashboard` · `GET /dashboard/chart`
`GET /reports/sales` · `GET /reports/top-packages` · `GET /reports/bookings` · `GET /reports/customers`

## Response format

```json
{ "success": true, "data": {}, "meta": {} }
{ "success": false, "message": "..." }
```

## Auth

Send `Authorization: Bearer <token>` on protected routes. Admins need the `admin` role for
management endpoints.
