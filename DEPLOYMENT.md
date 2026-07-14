# Deployment Guide

## Backend — Render

### Prerequisites

1. A [Render](https://render.com) account
2. MongoDB Atlas cluster (see below)
3. Git repository connected to Render

### Environment Variables (Render)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render assigns this) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string (at least 32 chars) |
| `CLIENT_URL` | Frontend URL (e.g., `https://your-app.vercel.app`) |
| `SMTP_HOST` | SMTP server hostname (optional, for emails) |
| `SMTP_PORT` | SMTP port (optional, default 587) |
| `SMTP_USER` | SMTP username (optional) |
| `SMTP_PASS` | SMTP password (optional) |
| `EMAIL_FROM` | Sender email address (optional) |

### Build & Start Commands

- **Build**: `npm install`
- **Start**: `npm start` (runs `node server.js`)

### Health Check

Set Render health check path to: `/api/v1/health`

---

## Frontend — Vercel

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. Git repository connected to Vercel

### Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (e.g., `https://your-app.onrender.com/api/v1`) |

### Build & Output Settings

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+

### Rewrites (for SPA routing)

Add to `vercel.json` in project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## MongoDB Atlas Production Configuration

1. Create an Atlas cluster (M10+ recommended for production)
2. Set up database user with strong password
3. Whitelist Render's IP range or use `0.0.0.0/0` with strong auth
4. Enable IP-based access list
5. Use SRV connection string format:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/last-mile-delivery?retryWrites=true&w=majority
   ```

### Indexes (applied automatically in dev, manually in production)

Run the following in `mongosh` for each collection:

```javascript
db.orders.createIndex({ trackingId: 1 }, { unique: true });
db.orders.createIndex({ customer: 1 });
db.orders.createIndex({ status: 1 });
db.agents.createIndex({ email: 1 }, { unique: true });
db.agents.createIndex({ phone: 1 }, { unique: true });
db.agents.createIndex({ status: 1 });
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, isRead: 1 });
db.trackingevents.createIndex({ order: 1, createdAt: 1 });
db.ratecards.createIndex({ sourceZone: 1, destinationZone: 1, isActive: 1 });
```

---

## Pre-Deployment Checklist

- [ ] `NODE_ENV=production` set on Render
- [ ] `autoIndex: false` in db.js (already configured)
- [ ] All environment variables set on Render and Vercel
- [ ] CORS `CLIENT_URL` points to correct Vercel URL
- [ ] Rate limiting configured (already in app.js)
- [ ] Stack traces hidden (already in errorHandler.js)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Health check returns 200
