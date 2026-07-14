# Last Mile Delivery Tracker

A full-stack delivery operations platform for managing orders, agents, zones, pricing, tracking, and analytics.

---

## Features

- **Customer Portal** — Create orders, view order history, track deliveries, reschedule failed deliveries
- **Admin Portal** — Manage zones, areas, rate cards, agents, orders; analytics dashboard; manual/auto assignment
- **Authentication** — JWT-based auth with role-based access (customer, admin, agent)
- **Zone & Area Management** — Define delivery zones and areas with hierarchical mapping
- **Rate Cards** — B2B/B2C segmented pricing between zone pairs
- **Pricing Engine** — Calculates chargeable weight (actual vs volumetric), applies rate cards, COD surcharge
- **Agent Management** — CRUD for delivery agents, status tracking, area assignments
- **Order Management** — Full lifecycle: create, assign, track, cancel, fail, reschedule, deliver
- **Assignment Engine** — Auto-assigns best agent based on area/zone matching and workload balancing
- **Tracking Timeline** — Automatic event recording on every status change
- **Failed Delivery & Rescheduling** — Mark failed with reason, customer reschedule, auto-reassign
- **Notifications** — In-app notification bell with unread counts
- **Analytics Dashboard** — Aggregated metrics with date range filtering (today, 7d, 30d, custom)
- **Security** — Rate limiting, Helmet headers, CORS, Zod validation, bcrypt hashing, MongoDB injection sanitization

---

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS v4, React Router v7, Recharts

**Backend** — Node.js, Express 5, Mongoose 9, Zod validation

**Database** — MongoDB Atlas

**Auth** — JWT (1h access tokens, bcrypt hashing)

---

## Folder Structure

```
last-mile-delivery-tracker/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # AuthContext provider
│   │   ├── layouts/           # Layout, AdminLayout
│   │   ├── pages/             # Route pages (admin/, customer/, root)
│   │   └── services/          # API client modules
│   └── ...
├── server/                    # Express backend
│   ├── config/                # Env & DB config
│   ├── constants/             # Messages & roles
│   ├── controllers/           # Request handlers
│   ├── middleware/             # Auth, role, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── services/              # Business logic
│   ├── utils/                 # Helpers
│   └── validators/            # Zod validation schemas
├── docs/                      # Documentation
│   ├── api.md                 # Full API reference
│   ├── database.md            # Schema design
│   └── system-design.md       # Architecture write-up
├── .env.example
├── DEPLOYMENT.md
├── TESTING.md
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

### Setup

```bash
# Clone the repository
git clone https://github.com/Soham-Ambar/last-mile-delivery-tracker.git
cd last-mile-delivery-tracker

# Backend
cd server
cp .env.example .env   # Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev            # Starts on http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env   # Edit VITE_API_URL if needed
npm install
npm run dev            # Starts on http://localhost:5173
```

---

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `CLIENT_URL` | Frontend URL for CORS |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender email address |

---

## Running the Project

```bash
# Backend (development with auto-reload)
cd server && npm run dev

# Backend (production)
cd server && npm start

# Frontend (development)
cd client && npm run dev

# Frontend (production build)
cd client && npm run build
```

---

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference covering:

- Authentication (register, login, profile)
- Zone, Area, Rate Card, Agent CRUD
- Order management (create, list, update, cancel)
- Assignment (manual, auto, unassign)
- Tracking timeline
- Failed delivery & rescheduling
- Pricing estimate
- Notifications
- Analytics dashboard

---

## Database Schema

See [docs/database.md](docs/database.md) for full schema documentation covering:

- Users, Zones, Areas, Agents, Orders, Rate Cards, Tracking Events, Notifications
- Soft delete pattern
- Indexes and relationships

---

## System Design

See [docs/system-design.md](docs/system-design.md) for an architectural overview (800 words) covering:

- Architecture (frontend, backend, database)
- Zone detection
- Pricing engine
- Auto assignment algorithm
- Failed delivery workflow
- Security

---

## Testing

See [TESTING.md](TESTING.md) for:

- API endpoint checklist
- Manual UI testing checklist
- Security verification checklist
- Known limitations

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific guides (Render + Vercel) covering:

- Environment variable configuration
- Build commands
- MongoDB Atlas setup
- Pre-deployment checklist

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | (To be added) |
| **Backend** | (To be added) |
