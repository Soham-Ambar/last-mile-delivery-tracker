# Last Mile Delivery Tracker

A full-stack **Last Mile Delivery Management System** built using the MERN stack. The application enables customers to place delivery orders while providing administrators with complete operational control over zones, areas, pricing, agents, orders, tracking, notifications, and analytics.

---

# Live Demo

### Frontend
https://last-mile-frontend.onrender.com

### Backend API
https://last-mile-backend-9m4d.onrender.com/api/v1

### Health Check
https://last-mile-backend-9m4d.onrender.com/api/v1/health

---

# Demo Credentials

## Admin

**Email**

```
admintest@test.com
```

**Password**

```
TestAdmin123!
```

You can use these credentials to explore all admin features including:

- Dashboard
- Zone Management
- Area Management
- Rate Cards
- Delivery Agents
- Orders
- Assignment Engine
- Tracking
- Notifications
- Analytics

---

## Features

### Customer Portal

- Customer Registration & Login
- Create Delivery Orders
- Live Price Estimation
- View Order History
- Order Tracking Timeline
- Cancel Orders
- Reschedule Failed Deliveries
- Notifications

### Admin Portal

- Dashboard
- Zone Management
- Area Management
- Rate Card Management
- Delivery Agent Management
- Customer Order Management
- Manual Agent Assignment
- Automatic Agent Assignment
- Failed Delivery Management
- Notifications
- Analytics Dashboard

### Core Modules

- JWT Authentication
- Role-Based Authorization
- Zone & Area Management
- Pricing Engine
- Rate Cards (B2B/B2C)
- Delivery Assignment Engine
- Tracking Timeline
- Failed Delivery & Rescheduling
- Notification System
- Analytics Dashboard

### Security

- JWT Authentication
- bcrypt Password Hashing
- Helmet Security Headers
- MongoDB Injection Protection
- Rate Limiting
- Zod Validation
- Role-Based Access Control
- CORS Protection

---

# Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Zod
- Nodemailer

## Database

- MongoDB Atlas

---

# Folder Structure

```
last-mile-delivery-tracker/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── ...
│
├── server/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
│
├── docs/
│   ├── api.md
│   ├── database.md
│   └── system-design.md
│
├── DEPLOYMENT.md
├── TESTING.md
├── .env.example
└── README.md
```

---

# Installation

## Prerequisites

- Node.js 18+
- MongoDB Atlas

---

## Clone Repository

```bash
git clone https://github.com/Soham-Ambar/last-mile-delivery-tracker.git

cd last-mile-delivery-tracker
```

---

## Backend

```bash
cd server

cp .env.example .env

npm install

npm run dev
```

Runs on

```
http://localhost:5000
```

---

## Frontend

```bash
cd client

cp .env.example .env

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# Environment Variables

See

```
.env.example
```

and

```
server/.env.example
```

Required variables include

| Variable | Description |
|----------|-------------|
| PORT | Backend Port |
| NODE_ENV | Environment |
| MONGO_URI | MongoDB Atlas URI |
| JWT_SECRET | JWT Secret |
| CLIENT_URL | Frontend URL |
| SMTP_HOST | SMTP Server |
| SMTP_PORT | SMTP Port |
| SMTP_USER | SMTP Username |
| SMTP_PASS | SMTP Password |
| EMAIL_FROM | Sender Email |

---

# Running

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

Production Backend

```bash
npm start
```

Production Frontend

```bash
npm run build
```

---

# API Documentation

Complete API documentation is available in

```
docs/api.md
```

Includes

- Authentication
- Zones
- Areas
- Rate Cards
- Pricing
- Agents
- Orders
- Assignment
- Tracking
- Failed Delivery
- Notifications
- Analytics

---

# Database Documentation

See

```
docs/database.md
```

Includes

- Collections
- Relationships
- Indexes
- Schema Design

---

# System Design

See

```
docs/system-design.md
```

Covers

- Architecture
- Zone Detection
- Pricing Engine
- Auto Assignment Logic
- Failed Delivery Handling
- Security

---

# Testing

See

```
TESTING.md
```

Contains

- API Testing
- UI Testing
- Security Testing
- Validation Checklist

---

# Deployment

Deployment guide available in

```
DEPLOYMENT.md
```

Includes

- Render Backend
- Render Frontend
- Environment Variables
- MongoDB Atlas
- Build Commands

---

# Project Highlights

- MERN Stack
- Production Deployment
- Responsive UI
- Modular Architecture
- Clean REST APIs
- JWT Authentication
- Auto Assignment Engine
- Dynamic Pricing Engine
- Tracking Timeline
- Notification System
- Analytics Dashboard

---

# Repository

GitHub

https://github.com/Soham-Ambar/last-mile-delivery-tracker

---

# Author

**Soham Ambar**

GitHub

https://github.com/Soham-Ambar

---

## Note for Evaluators

- The application is fully deployed and ready for testing.
- Demo admin credentials are provided above.
- Customer accounts can be created using the registration page.
- All APIs are documented under `docs/api.md`.
- The system design, database schema, deployment guide, and testing documentation are included in the repository.