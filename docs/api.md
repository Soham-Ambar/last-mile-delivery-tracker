# API Documentation

## Health Check

- **Endpoint:** `GET /api/v1/health`
- **Auth:** None
- **Response:** `{ "status": "success", "message": "API is healthy" }`
- **Status:** `200`

---

## Authentication

### Register

`POST /api/v1/auth/register`

Register a new customer account.

**Request body:**
```json
{
  "name": "string (required, min 2)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8)",
  "phone": "string (optional, min 8)"
}
```

**Response:** `201` — `{ success, message, data: { id, name, email, role } }`

**Errors:** `400` Validation, `409` Duplicate email

### Login

`POST /api/v1/auth/login`

**Request body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:** `200` — `{ success, message, data: { token, user: { id, name, email, role } } }`

**Errors:** `400` Validation, `401` Invalid credentials

### Profile

`GET /api/v1/auth/profile`

**Auth:** Bearer token

**Response:** `200` — `{ success, message, data: { id, name, email, role } }`

**Errors:** `401`

### Logout

`POST /api/v1/auth/logout` — Returns `501 Not Implemented`

---

## Zone Management (Admin)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/zones` | POST | Create zone |
| `/api/v1/zones` | GET | List active zones |
| `/api/v1/zones/:id` | GET | Get single zone |
| `/api/v1/zones/:id` | PUT | Update zone |
| `/api/v1/zones/:id` | DELETE | Soft-delete zone |

**Auth:** Admin bearer token

**Zone fields:** `name` (unique), `description`, `isActive`

**Errors:** `400`, `401`, `404`, `500`

---

## Area Management (Admin)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/areas` | POST | Create area |
| `/api/v1/areas` | GET | List areas (query: `?zone=zoneId` filter) |
| `/api/v1/areas/:id` | GET | Get single area |
| `/api/v1/areas/:id` | PUT | Update area |
| `/api/v1/areas/:id` | DELETE | Soft-delete area |

**Auth:** Admin bearer token

**Area fields:** `name`, `city`, `state`, `pincode`, `zone` (ref), `location` `{ lat, lng }`

**Errors:** `400`, `401`, `404`, `500`

---

## Rate Card Management (Admin)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/rate-cards` | POST | Create rate card |
| `/api/v1/rate-cards` | GET | List rate cards |
| `/api/v1/rate-cards/:id` | GET | Get single rate card |
| `/api/v1/rate-cards/:id` | PUT | Update rate card |
| `/api/v1/rate-cards/:id` | DELETE | Soft-delete rate card |

**Auth:** Admin bearer token

**Rate card fields:** `name`, `sourceZone`, `destinationZone`, `estimatedDeliveryDays`, `pricing.b2b` `{ baseRate, ratePerKg, minimumCharge, codCharge }`, `pricing.b2c` `{ baseRate, ratePerKg, minimumCharge, codCharge }`

**Errors:** `400`, `401`, `404`, `409` (duplicate zone pair), `500`

---

## Agent Management (Admin)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/agents` | POST | Create agent |
| `/api/v1/agents` | GET | List agents (query: `?status=&vehicleType=` filters) |
| `/api/v1/agents/:id` | GET | Get single agent |
| `/api/v1/agents/:id` | PUT | Update agent |
| `/api/v1/agents/:id` | DELETE | Soft-delete agent |
| `/api/v1/agents/:id/status` | PATCH | Update agent status |
| `/api/v1/agents/:id/areas` | PATCH | Update assigned areas |

**Auth:** Admin bearer token

**Agent fields:** `name`, `email`, `phone`, `password`, `vehicleType` (Bike|Scooter|Car|Van), `status` (Available|Busy|Offline), `assignedAreas` (Area[]), `isActive`

**Agent status PATCH body:** `{ "status": "Available"|"Busy"|"Offline" }`

**Agent areas PATCH body:** `{ "assignedAreas": ["areaId1", "areaId2"] }`

**Errors:** `400`, `401`, `404`, `409`, `500`

---

## Order Management

### Create Order

`POST /api/v1/orders`

**Auth:** Customer bearer token

**Request body:**
```json
{
  "pickupName": "string (required)",
  "pickupPhone": "string (required)",
  "pickupAddress": "string (required)",
  "pickupArea": "Area ObjectId (required)",
  "receiverName": "string (required)",
  "receiverPhone": "string (required)",
  "receiverAddress": "string (required)",
  "deliveryArea": "Area ObjectId (required, must differ from pickupArea)",
  "parcelType": "Document|Clothing|Electronics|Food|Medicine|Other",
  "parcelWeight": "number > 0 (required)",
  "length": "number (optional, cm)",
  "breadth": "number (optional, cm)",
  "height": "number (optional, cm)",
  "paymentMode": "Prepaid|COD",
  "orderType": "B2C|B2B (default: B2C)"
}
```

**Response:** `201` — Full order object with `trackingId` and `priceBreakdown`

**Errors:** `400`, `401`, `500`

### Customer: My Orders

`GET /api/v1/orders/my-orders`

**Auth:** Customer bearer token

**Response:** `200` — Array of customer's orders

### Admin: All Orders

`GET /api/v1/orders/admin`

**Auth:** Admin bearer token

**Query params:** `?status=&page=&limit=&sort=`

**Response:** `200` — Paginated array of all orders

### Get Order

`GET /api/v1/orders/:id`

**Auth:** Bearer token (customer: own orders only, admin: any)

**Response:** `200` — Single order object

**Errors:** `401`, `403`, `404`

### Update Order

`PUT /api/v1/orders/:id`

**Auth:** Admin bearer token

**Request body (all optional):** `status`, `assignedAgent`, `notes`

**Response:** `200`

**Errors:** `400`, `401`, `404`

### Cancel Order

`PATCH /api/v1/orders/:id/cancel`

**Auth:** Customer bearer token (own order only)

**Restrictions:** Only Pending or Confirmed orders can be cancelled

**Response:** `200`

**Errors:** `400`, `401`, `403`, `404`

### Admin Create Order

`POST /api/v1/orders/admin`

**Auth:** Admin bearer token

**Request body:** Same as Create Order plus `customerId` (User ObjectId, required)

**Response:** `201`

---

## Assignment Engine (Admin)

### Manual Assign

`PATCH /api/v1/orders/:id/assign`

**Auth:** Admin bearer token

**Request body:** `{ "agentId": "Agent ObjectId" }`

**Rules:**
- Order must not be Delivered, Cancelled, or already assigned
- Agent must be `isActive: true` (status check is skipped)

**Behavior:** Order → `Assigned`, agent status **not changed**

**Response:** `200`

**Errors:** `400`, `401`, `404`

### Auto Assign

`POST /api/v1/orders/:id/auto-assign`

**Auth:** Admin bearer token

**Algorithm:**
1. Find agents: `isActive=true`, `status=Available`, `assignedAreas` contains the order's delivery area (exact match)
2. If none — fallback to agents assigned to any area in the same zone as the delivery area
3. Among eligible agents, count active orders (status: Assigned, Confirmed, PickedUp, InTransit, OutForDelivery)
4. Pick agent with fewest active orders; tie-break by earliest `createdAt`
5. Order → `Assigned`, agent status **not changed**

**Response:** `200`

**Errors:** `400` (cannot assign), `404` (no eligible agent)

### Unassign

`PATCH /api/v1/orders/:id/unassign`

**Auth:** Admin bearer token

**Behavior:** Order → `Confirmed`, `assignedAgent` cleared, agent → `Available`, tracking event, notification sent

**Response:** `200`

**Errors:** `400` (no assigned agent), `401`, `404`

---

## Tracking Timeline

`GET /api/v1/orders/:id/tracking`

**Auth:** Bearer token (admin or customer owner)

**Response:** `200` — Array of events sorted chronologically

Each event: `{ _id, order, status, message, location?, updatedBy?, createdAt }`

Events auto-created on: order creation, status update, cancellation, assign, unassign, fail, reschedule

**Errors:** `401`, `403`, `404`

---

## Failed Delivery & Rescheduling

### Mark as Failed

`PATCH /api/v1/orders/:id/fail`

**Auth:** Admin bearer token

**Request body:** `{ "failedReason": "string (required, max 500)" }`

**Restrictions:** Only `Assigned`, `PickedUp`, `InTransit`, `OutForDelivery` orders

**Behavior:** Status → `Failed`, delivery attempt logged, agent released → `Available`, tracking event, notifications

**Response:** `200`

**Errors:** `400`, `401`, `403`, `404`

### Reschedule

`PATCH /api/v1/orders/:id/reschedule`

**Auth:** Customer bearer token (owner only)

**Request body:** `{ "newDate": "ISO date string" }`

**Restrictions:** Only `Failed` orders; owner only

**Behavior:** Status → `Confirmed`, tracking events, auto-assign new agent (if available)

**Response:** `200`

**Errors:** `400`, `401`, `403`, `404`

---

## Pricing Estimate

`POST /api/v1/pricing/estimate`

**Auth:** Bearer token

**Request body:**
```json
{
  "sourceZone": "Zone ObjectId",
  "destinationZone": "Zone ObjectId",
  "weight": "number (required, kg)",
  "length": "number (optional, cm)",
  "breadth": "number (optional, cm)",
  "height": "number (optional, cm)",
  "paymentMode": "Prepaid|COD",
  "orderType": "B2C|B2B (default: B2C)"
}
```

**Calculation:**
- Volumetric weight = (L × B × H) / 5000
- Chargeable weight = max(actualWeight, volumetricWeight)
- Price = baseRate + (chargeableWeight × ratePerKg), floor at minimumCharge
- COD surcharge added for COD orders

**Response:** `200` — `{ baseRate, weightCharge, codCharge, minimumChargeApplied, actualWeight, volumetricWeight, chargeableWeight, estimatedDeliveryDays, totalPrice }`

**Errors:** `400`, `401`, `404` (no rate card), `500`

---

## Notifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/notifications` | GET | List user notifications (paginated) |
| `/api/v1/notifications/unread-count` | GET | Unread count |
| `/api/v1/notifications/:id/read` | PATCH | Mark single as read |
| `/api/v1/notifications/read-all` | PATCH | Mark all as read |
| `/api/v1/notifications/:id` | DELETE | Delete notification |

**Auth:** Bearer token (own notifications only)

**Response:** `200`

---

## Users (Admin)

`GET /api/v1/users/customers`

**Auth:** Admin bearer token

**Response:** `200` — Array of `{ _id, name, email, phone, isActive }`

**Errors:** `401`, `403`

---

## Analytics Dashboard

`GET /api/v1/analytics/dashboard`

**Auth:** Admin bearer token

**Query params:** `?range=today|7days|30days|all|custom&startDate=&endDate=`

**Response:** `200` — Object with overview stats, revenue, delivery metrics, order counts, top zones/agents, chart data

**Errors:** `401`, `500`
