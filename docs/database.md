# Database Design

MongoDB Atlas with Mongoose ODM.

---

## Collections

### Users

**File:** `server/models/User.js`

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Unique, lowered |
| `password` | String | bcrypt hashed, `select: false` |
| `phone` | String | Optional |
| `role` | String | `customer` | `admin` | `agent` |
| `isActive` | Boolean | Default `true` |
| timestamps | — | createdAt, updatedAt |

**Indexes:** `email` (unique)

---

### Zones

**File:** `server/models/Zone.js`

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Unique, required |
| `description` | String | Optional |
| `isActive` | Boolean | Default `true` (soft delete) |
| `createdBy` | ObjectId | ref: User |

**Indexes:** `name` (unique)

---

### Areas

**File:** `server/models/Area.js`

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `city` | String | Required |
| `state` | String | Required |
| `pincode` | String | Required |
| `location.lat` | Number | Optional — for distance-based routing |
| `location.lng` | Number | Optional — for distance-based routing |
| `zone` | ObjectId | ref: Zone, required |
| `isActive` | Boolean | Default `true` (soft delete) |
| `createdBy` | ObjectId | ref: User |

---

### Rate Cards

**File:** `server/models/RateCard.js`

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `sourceZone` | ObjectId | ref: Zone |
| `destinationZone` | ObjectId | ref: Zone |
| `pricing.b2b` | Subdoc | `{ baseRate, ratePerKg, minimumCharge, codCharge }` |
| `pricing.b2c` | Subdoc | `{ baseRate, ratePerKg, minimumCharge, codCharge }` |
| `estimatedDeliveryDays` | Number | Required |
| `isActive` | Boolean | Default `true` (soft delete) |
| `createdBy` | ObjectId | ref: User |

**Indexes:** `{ sourceZone, destinationZone, isActive }` (compound)

**Constraints:** Duplicate active rate cards with same source+destination are prevented.

---

### Agents

**File:** `server/models/Agent.js`

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Unique |
| `phone` | String | Unique |
| `password` | String | bcrypt hashed, `select: false` |
| `assignedAreas` | ObjectId[] | ref: Area |
| `vehicleType` | String | `Bike` | `Scooter` | `Car` | `Van` |
| `status` | String | `Available` | `Busy` | `Offline`; default `Available` |
| `isActive` | Boolean | Default `true` |

**Indexes:** `email` (unique), `phone` (unique), `status`

---

### Orders

**File:** `server/models/Order.js`

| Field | Type | Notes |
|-------|------|-------|
| `trackingId` | String | Unique, format: `LMD-YYYYMMDD-NNNNNN` |
| `customer` | ObjectId | ref: User |
| `pickupName`, `pickupPhone`, `pickupAddress` | String | Required |
| `pickupArea`, `pickupZone` | ObjectId | ref: Area, ref: Zone |
| `receiverName`, `receiverPhone`, `receiverAddress` | String | Required |
| `deliveryArea`, `deliveryZone` | ObjectId | ref: Area, ref: Zone |
| `parcelType` | String | Document | Clothing | Electronics | Food | Medicine | Other |
| `parcelWeight` | Number | kg |
| `length`, `breadth`, `height` | Number | cm (optional) |
| `actualWeight`, `volumetricWeight`, `chargeableWeight` | Number | |
| `orderType` | String | `B2C` | `B2B` (default `B2C`) |
| `paymentMode` | String | `Prepaid` | `COD` |
| `priceBreakdown` | Subdoc | `{ baseRate, weightCharge, codCharge, minimumChargeApplied, estimatedDeliveryDays, totalPrice }` |
| `totalPrice` | Number | |
| `status` | String | Pending → Confirmed → Assigned → PickedUp → InTransit → OutForDelivery → Delivered (or Failed → Cancelled) |
| `assignedAgent` | ObjectId | ref: Agent |
| `assignedAt` | Date | |
| `deliveryAttempt` | Number | Default 0 |
| `rescheduleCount` | Number | Default 0 |
| `failedReason` | String | |
| `rescheduledDate` | Date | |
| `lastFailedAt` | Date | |
| `deliveryHistory` | Array | `{ attemptNumber, failedReason, failedAt, agent, rescheduledDate, completedAt }` |
| `notes` | String | |
| `isActive` | Boolean | Default `true` |

**Indexes:** `trackingId` (unique), `customer`, `status`, `assignedAgent`

---

### Tracking Events

**File:** `server/models/TrackingEvent.js`

| Field | Type | Notes |
|-------|------|-------|
| `order` | ObjectId | ref: Order |
| `status` | String | Event type (see order statuses + Rescheduled, Reassigned) |
| `message` | String | Auto-generated human-readable description |
| `location` | String | Optional |
| `updatedBy` | ObjectId | ref: User |

**Indexes:** `{ order, createdAt }` (compound, for timeline queries)

**Immutability:** Events are never overwritten, only appended.

---

### Notifications

**File:** `server/models/Notification.js`

| Field | Type | Notes |
|-------|------|-------|
| `recipient` | ObjectId | ref: User |
| `order` | ObjectId | ref: Order (optional) |
| `title` | String | |
| `message` | String | |
| `type` | String | Notification type (e.g. OrderAssigned, OrderFailed) |
| `isRead` | Boolean | Default `false` |
| `metadata` | Mixed | Optional extra data |

**Indexes:** `{ recipient, createdAt }`, `{ recipient, isRead }`

---

## Relationships

```
User
 ┣━━ Orders (customer)
 ┣━━ Notifications (recipient)
 ┗━━ Created Zones / Areas / Rate Cards / Agents (createdBy)

Zone
 ┣━━ Areas (zone)
 ┣━━ RateCards (sourceZone / destinationZone)
 ┗━━ Orders (pickupZone / deliveryZone)

Area
 ┣━━ Agents (assignedAreas)
 ┗━━ Orders (pickupArea / deliveryArea)

Agent
 ┗━━ Orders (assignedAgent)

Order
 ┗━━ TrackingEvents (order)
```

## Soft Delete

All admin-managed models (Zone, Area, RateCard, Agent) use soft delete via `isActive: false`. List endpoints exclude inactive records.

## Volumetric Weight Formula

```
volumetricWeight = (length × breadth × height) / 5000
chargeableWeight = max(actualWeight, volumetricWeight)
```

## Connection

Configured via `MONGO_URI` in `.env`. Connection established in `server/config/db.js`.
