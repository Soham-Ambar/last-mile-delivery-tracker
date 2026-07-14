# Testing Guide

## API Checklist

### Authentication

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/auth/register` | POST | Register new customer | ✓ |
| `/api/v1/auth/register` | POST | Duplicate email returns 409 | ✓ |
| `/api/v1/auth/login` | POST | Valid credentials returns token | ✓ |
| `/api/v1/auth/login` | POST | Invalid credentials returns 401 | ✓ |
| `/api/v1/auth/profile` | GET | Valid token returns user | ✓ |
| `/api/v1/auth/profile` | GET | No token returns 401 | ✓ |

### Zones (admin only)

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/zones` | POST | Create zone | ✓ |
| `/api/v1/zones` | GET | List zones (paginated) | ✓ |
| `/api/v1/zones/:id` | GET | Get single zone | ✓ |
| `/api/v1/zones/:id` | PUT | Update zone | ✓ |
| `/api/v1/zones/:id` | DELETE | Soft-delete zone | ✓ |
| `/api/v1/zones` | GET | Non-admin returns 403 | ✓ |

### Areas (admin only)

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/areas` | POST | Create area | ✓ |
| `/api/v1/areas` | GET | List areas (paginated, filter by zone) | ✓ |
| `/api/v1/areas/:id` | GET | Get single area | ✓ |
| `/api/v1/areas/:id` | PUT | Update area | ✓ |
| `/api/v1/areas/:id` | DELETE | Soft-delete area | ✓ |

### Rate Cards (admin only)

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/rate-cards` | POST | Create rate card | ✓ |
| `/api/v1/rate-cards` | GET | List rate cards (paginated) | ✓ |
| `/api/v1/rate-cards/:id` | GET | Get single rate card | ✓ |
| `/api/v1/rate-cards/:id` | PUT | Update rate card | ✓ |
| `/api/v1/rate-cards/:id` | DELETE | Soft-delete rate card | ✓ |
| `/api/v1/rate-cards` | POST | Duplicate zone pair returns 409 | ✓ |

### Agents (admin only)

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/agents` | POST | Create agent | ✓ |
| `/api/v1/agents` | GET | List agents (paginated, filter by status/vehicle) | ✓ |
| `/api/v1/agents/:id` | GET | Get single agent | ✓ |
| `/api/v1/agents/:id` | PUT | Update agent | ✓ |
| `/api/v1/agents/:id` | DELETE | Soft-delete agent | ✓ |
| `/api/v1/agents/:id/status` | PATCH | Update agent status | ✓ |
| `/api/v1/agents/:id/areas` | PATCH | Update agent areas | ✓ |

### Orders

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/orders` | POST | Create order (customer) | ✓ |
| `/api/v1/orders/admin` | POST | Create order (admin on behalf) | ✓ |
| `/api/v1/orders/my-orders` | GET | Customer's own orders | ✓ |
| `/api/v1/orders/admin` | GET | All orders (admin, paginated, filter by status) | ✓ |
| `/api/v1/orders/:id` | GET | Single order (owner + admin) | ✓ |
| `/api/v1/orders/:id` | GET | Other customer gets 403 | ✓ |
| `/api/v1/orders/:id` | PUT | Update order (admin) | ✓ |
| `/api/v1/orders/:id/cancel` | PATCH | Cancel order (customer owner) | ✓ |
| `/api/v1/orders/:id/cancel` | PATCH | Cancel in wrong status returns 400 | ✓ |

### Assignment

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/orders/:id/assign` | PATCH | Manual assign agent | ✓ |
| `/api/v1/orders/:id/auto-assign` | POST | Auto-assign best agent | ✓ |
| `/api/v1/orders/:id/unassign` | PATCH | Unassign agent | ✓ |
| `/api/v1/orders/:id/assign` | PATCH | Assign already assigned returns 400 | ✓ |

### Tracking

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/orders/:id/tracking` | GET | Get timeline (admin + owner) | ✓ |
| `/api/v1/orders/:id/tracking` | GET | Other customer gets 403 | ✓ |

### Failed Delivery

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/orders/:id/fail` | PATCH | Mark as failed (admin) | ✓ |
| `/api/v1/orders/:id/fail` | PATCH | Fail non-failable status returns 400 | ✓ |
| `/api/v1/orders/:id/reschedule` | PATCH | Reschedule failed order (customer) | ✓ |
| `/api/v1/orders/:id/reschedule` | PATCH | Reschedule non-failed returns 400 | ✓ |
| `/api/v1/orders/:id/reschedule` | PATCH | Other customer reschedule returns 403 | ✓ |

### Notifications

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/notifications` | GET | List user notifications (paginated) | ✓ |
| `/api/v1/notifications/unread-count` | GET | Get unread count | ✓ |
| `/api/v1/notifications/:id/read` | PATCH | Mark single as read | ✓ |
| `/api/v1/notifications/read-all` | PATCH | Mark all as read | ✓ |
| `/api/v1/notifications/:id` | DELETE | Delete notification | ✓ |

### Analytics (admin only)

| Endpoint | Method | Test | Status |
|----------|--------|------|--------|
| `/api/v1/analytics/dashboard` | GET | Get dashboard data | ✓ |
| `/api/v1/analytics/dashboard` | GET | Non-admin returns 401 | ✓ |
| `/api/v1/analytics/dashboard?range=today` | GET | Today filter | ✓ |
| `/api/v1/analytics/dashboard?range=7days` | GET | 7-day filter | ✓ |
| `/api/v1/analytics/dashboard?range=30days` | GET | 30-day filter | ✓ |
| `/api/v1/analytics/dashboard?range=all` | GET | All time | ✓ |

### Security

| Test | Status |
|------|--------|
| Rate limiting enabled on /api/ | ✓ |
| CORS restricted to CLIENT_URL | ✓ |
| Helmet headers present | ✓ |
| Request body limited to 1mb | ✓ |
| No stack traces in production | ✓ |
| MongoDB injection sanitized | ✓ |
| JWT signature verified | ✓ |
| Passwords bcrypt-hashed | ✓ |
| Non-admin blocked from admin routes (403) | ✓ |
| Unauthenticated requests get 401 | ✓ |

---

## Manual UI Checklist

- [ ] Register a new customer account
- [ ] Login/logout loop works
- [ ] Customer can create an order
- [ ] Pricing estimate shown during order creation
- [ ] Customer can view their orders
- [ ] Customer can view order detail with tracking timeline
- [ ] Customer can cancel a pending order
- [ ] Customer sees bell notification badge
- [ ] Notification bell dropdown shows previews
- [ ] Customer can mark notifications as read
- [ ] Customer can reschedule a failed delivery
- [ ] Admin can login
- [ ] Admin dashboard loads with welcome message
- [ ] Admin analytics page loads with charts and data
- [ ] Admin analytics date filters work
- [ ] Admin zone CRUD works
- [ ] Admin area CRUD works
- [ ] Admin rate card CRUD works
- [ ] Admin agent CRUD works
- [ ] Admin order list loads with status badges
- [ ] Admin can update order status
- [ ] Admin can assign agent manually
- [ ] Admin can auto-assign agent
- [ ] Admin can unassign agent
- [ ] Admin can mark order as failed with reason
- [ ] Admin create-order (on behalf of customer) works
- [ ] Admin notification bell works
- [ ] Responsive layout works on mobile
- [ ] Navigation is intuitive

## Known Limitations

1. **No refresh token rotation** — single JWT with 1h expiry, no refresh token endpoint
2. **Logout is not implemented** — returns 501, no token blacklist
3. **Email sending is best-effort** — SMTP failures are logged but not retried
4. **No WebSocket/real-time updates** — notification badge polls every 30s
5. **No file uploads** — no support for proof-of-delivery images
6. **No sorting on all list fields** — pagination supports sort by createdAt only
7. **Analytics is not cached** — each request runs 9 aggregation pipelines
8. **No multi-language support** — UI is English-only
9. **No role-based UI for agents** — agent dashboard is placeholder only
10. **No export functionality** — no CSV/PDF export for orders or analytics
