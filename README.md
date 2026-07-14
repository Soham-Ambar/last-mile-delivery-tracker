# Last Mile Delivery Tracker

A full-stack **Last Mile Delivery Management System** built on the MERN stack. The platform enables customers to place delivery orders, track shipments in real time, and reschedule failed deliveries, while giving administrators complete operational control over zones, areas, pricing, agents, orders, and analytics.

The system features a dynamic pricing engine that computes chargeable weight (actual vs. volumetric) and applies B2B or B2C rate cards, an intelligent assignment engine that matches orders to the best available agent based on area/zone coverage and workload balancing, and a comprehensive tracking timeline that records every status change as an immutable event.

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://last-mile-frontend.onrender.com](https://last-mile-frontend.onrender.com) |
| **Backend API** | [https://last-mile-backend-9m4d.onrender.com/api/v1](https://last-mile-backend-9m4d.onrender.com/api/v1) |
| **Health Endpoint** | [https://last-mile-backend-9m4d.onrender.com/api/v1/health](https://last-mile-backend-9m4d.onrender.com/api/v1/health) |

---

## Demo Credentials

### Admin Account

| Field | Value |
|-------|-------|
| **Email** | `admintest@test.com` |
| **Password** | `TestAdmin123!` |

Use these credentials to log in and explore the full admin dashboard: zone management, area management, rate cards, delivery agents, order management, assignment engine, tracking, notifications, and analytics.

### Customer Accounts

Customers can create their own accounts by visiting the **Register** page on the frontend. No admin approval is required.

---

## Features

### Customer Portal
- Registration and login
- Create delivery orders with live price estimation
- View order history with status badges
- Real-time tracking timeline for each order
- Cancel pending and confirmed orders
- Reschedule failed deliveries with a new date
- In-app notification bell with unread counts

### Admin Portal
- Operational dashboard with key metrics
- Zone management (CRUD with soft delete)
- Area management linked to zones
- Rate card management (B2B/B2C segmented pricing)
- Delivery agent management with status and area assignments
- Customer order management (create, update, cancel)
- Manual agent assignment (assign any active agent)
- Automatic agent assignment (best-fit algorithm)
- Failed delivery handling with reason logging
- Full notification inbox
- Analytics dashboard with date range filtering

### Delivery Agent Features
- Agent profiles with vehicle type and contact details
- Status tracking (Available / Busy / Offline)
- Area assignment linking agents to service zones
- Workload-aware order distribution

### Pricing Engine
- Rate cards defined per zone pair with B2B and B2C pricing
- Volumetric weight calculation: `(length x breadth x height) / 5000`
- Chargeable weight: `max(actualWeight, volumetricWeight)`
- Final price: `baseRate + (chargeableWeight x ratePerKg)`, floored at minimum charge
- COD surcharge applied for cash-on-delivery orders
- Standalone estimate endpoint for price previews

### Assignment Engine
- Area matching: agents assigned to the exact delivery area are preferred
- Zone fallback: if no direct area match, agents in the same zone are eligible
- Workload balancing: counts active orders across agents, picks the least loaded
- Tie-breaking: earliest-created agent wins
- Manual assignment bypasses availability checks for admin flexibility

### Tracking Timeline
- Immutable event log for every status change
- Events: Pending, Confirmed, Assigned, PickedUp, InTransit, OutForDelivery, Failed, Delivered, Cancelled, Rescheduled, Reassigned
- Each event stores a human-readable message, timestamp, and the user who triggered it
- Sorted chronologically for a clear delivery journey view

### Notifications
- In-app notifications for order assignment, failure, rescheduling, and unassignment
- Bell icon with unread badge count
- Mark individual or all notifications as read
- Delete notifications

### Analytics Dashboard
- Aggregated metrics: total orders, customers, agents, revenue
- Delivery statistics: average delivery time, success/failure rates, average attempts
- Top-performing zones and agents
- Charts: orders per day, revenue per day, status distribution
- Date range filters: today, 7 days, 30 days, all time, custom

### Security
- JWT-based authentication with 1-hour token expiry
- bcrypt password hashing with `select: false` on queries
- Helmet security headers (CSP, X-Frame-Options, etc.)
- MongoDB injection sanitization
- Rate limiting: 100 requests per 15 minutes per IP
- Role-based access control (customer, admin)
- Zod validation on all request bodies
- CORS restricted to the frontend origin
- No stack traces in production responses

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, React Router v7, Axios, Recharts |
| **Backend** | Node.js, Express 5, Mongoose 9, Zod, Nodemailer |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (access tokens), bcrypt |
| **Deployment** | Render (backend), Render (frontend) |

---

## System Architecture

The application follows a standard client-server architecture.

- **Frontend:** A React single-page application built with Vite and TypeScript. Role-based route protection is provided by `ProtectedRoute` and `AdminRoute` wrapper components. API calls are abstracted into per-resource service modules. Recharts renders analytics charts with data from aggregation pipelines.

- **Backend:** An Express REST API organized into controllers (request handling), services (business logic), and models (Mongoose schemas). Zod validates incoming data. Middleware handles JWT verification, role authorization, rate limiting, security headers, CORS, and error handling.

- **Database:** MongoDB Atlas with Mongoose ODM. Collections include User, Zone, Area, Agent, Order, RateCard, TrackingEvent, and Notification. Admin-managed resources use soft deletion (`isActive: false`). Tracking events are immutable — appended on each status change, never overwritten.

- **REST APIs:** All communication between frontend and backend occurs over stateless REST endpoints. Responses follow a consistent JSON envelope: `{ success, message, data }`.

---

## Folder Structure

```
last-mile-delivery-tracker/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # AuthContext
│   │   ├── layouts/                 # Layout, AdminLayout
│   │   ├── pages/                   # Route pages
│   │   │   ├── admin/               # Admin-only pages
│   │   │   └── customer/            # Customer pages
│   │   └── services/                # API client modules
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                          # Express backend
│   ├── config/                      # Environment & database config
│   ├── constants/                   # Messages & roles
│   ├── controllers/                 # Request handlers
│   ├── middleware/                  # Auth, role, error, sanitize
│   ├── models/                      # Mongoose schemas
│   ├── routes/                      # Express routers
│   ├── services/                    # Business logic
│   ├── utils/                       # Helpers
│   ├── validators/                  # Zod validation schemas
│   ├── .env.example
│   ├── app.js
│   ├── package.json
│   └── server.js
├── docs/
│   ├── api.md                       # Full API documentation
│   ├── database.md                  # Schema documentation
│   └── system-design.md             # Architecture write-up
├── .env.example
├── .gitignore
├── DEPLOYMENT.md
├── TESTING.md
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB instance)

### Clone and Setup

```bash
git clone https://github.com/Soham-Ambar/last-mile-delivery-tracker.git
cd last-mile-delivery-tracker
```

### Backend

```bash
cd server
cp .env.example .env        # Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev                 # Starts on http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env        # Edit VITE_API_URL if needed
npm install
npm run dev                 # Starts on http://localhost:5173
```

---

## Environment Variables

Two `.env.example` files are provided:

- **Root:** `.env.example` (for the client — only `VITE_API_URL`)
- **Server:** `server/.env.example`

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 characters) |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `SMTP_HOST` | SMTP server hostname (optional, for email notifications) |
| `SMTP_PORT` | SMTP port (optional, default `587`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender email address |

---

## API Documentation

Full API documentation is available at [`docs/api.md`](docs/api.md). It covers every endpoint with method, path, auth requirements, request body, and response format.

**API modules:**
Authentication (register, login, profile) | Zones | Areas | Rate Cards | Agents | Orders | Assignment (manual, auto, unassign) | Tracking Timeline | Failed Delivery & Rescheduling | Pricing Estimate | Notifications | Users | Analytics Dashboard

---

## Database Documentation

See [`docs/database.md`](docs/database.md) for the complete schema design. It documents every collection, field, type, relationship, and index.

**Collections:** Users, Zones, Areas, Rate Cards, Agents, Orders, Tracking Events, Notifications

---

## System Design

See [`docs/system-design.md`](docs/system-design.md) for an architectural overview covering:

- Frontend, backend, and database architecture
- Zone detection (Area-to-Zone resolution)
- Pricing engine (volumetric weight, chargeable weight, B2B/B2C rates)
- Auto assignment algorithm (area match, zone fallback, workload balancing)
- Failed delivery workflow (mark failed, release agent, reschedule, reassign)
- Security model (JWT, bcrypt, Helmet, rate limiting, role-based access)

---

## Deployment Guide

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for platform-specific instructions covering Render (backend) and Render (frontend) setup, environment variables, MongoDB Atlas configuration, and the pre-deployment checklist.

---

## Testing Guide

See [`TESTING.md`](TESTING.md) for the API endpoint checklist, manual UI testing checklist, security verification checklist, and a list of known limitations.

---

## Project Modules

- [x] Authentication (register, login, profile, JWT)
- [x] Zone Management (CRUD, soft delete)
- [x] Area Management (CRUD, zone assignment)
- [x] Rate Cards (B2B/B2C pricing, zone pairs)
- [x] Pricing Engine (volumetric weight, chargeable weight, dynamic pricing)
- [x] Delivery Agents (CRUD, status, area assignment)
- [x] Orders (create, list, update, cancel, admin create)
- [x] Assignment Engine (manual assign, auto assign, unassign)
- [x] Tracking Timeline (immutable event log)
- [x] Failed Delivery & Rescheduling (mark failed, reschedule, auto-reassign)
- [x] Notifications (in-app, read/unread, delete)
- [x] Analytics Dashboard (aggregations, charts, date filters)
- [x] Security (JWT, bcrypt, Helmet, rate limiting, RBAC, validation)

---

## Deliverables Checklist

- [x] `README.md` — Project overview, live demo, credentials, features, tech stack, installation, environment variables, documentation references
- [x] `.env.example` — Client environment variable template
- [x] `server/.env.example` — Server environment variable template
- [x] `docs/api.md` — Complete API documentation
- [x] `docs/database.md` — Database schema documentation
- [x] `docs/system-design.md` — System architecture write-up
- [x] `DEPLOYMENT.md` — Deployment guide
- [x] `TESTING.md` — Testing guide

---

## Author

**Soham Ambar**

GitHub: [https://github.com/Soham-Ambar](https://github.com/Soham-Ambar)

---

## License

MIT License

---

## Note

- The application is fully deployed and accessible at the live demo URLs above.
- Admin credentials are provided for full access to all features.
- Customers can register new accounts directly from the Register page.
- API documentation, database schema documentation, and system design documentation are included in the `docs/` directory.
- A deployment guide and testing guide are included.
- The repository is ready for review and production use.
