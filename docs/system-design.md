# System Design

## Architecture

Last Mile Delivery Tracker follows a standard client-server architecture.

**Frontend:** React 18 SPA built with Vite and TypeScript. Tailwind CSS v4 handles styling. React Router v7 manages routing with role-based route protection via `ProtectedRoute` (authenticated) and `AdminRoute` (admin-only) wrapper components. Recharts renders analytics charts. API calls are abstracted into per-resource service modules under `client/src/services/`.

**Backend:** Express 5 REST API organized into controllers (request handling), services (business logic), and models (Mongoose schemas). Zod validates request bodies. Middleware handles authentication (JWT verification), role authorization, rate limiting (express-rate-limit), security headers (Helmet), CORS, MongoDB injection sanitization, and global error handling.

**Database:** MongoDB Atlas with Mongoose ODM. Collections include User, Zone, Area, Agent, Order, RateCard, TrackingEvent, and Notification. Soft deletes are used for admin-managed resources (`isActive: false`). Tracking events are immutable — appended on each status change.

## Zone Detection

Areas belong to Zones via a `zone` reference field. When an order is created, both `pickupArea` and `deliveryArea` are specified, and their corresponding zones (`pickupZone`, `deliveryZone`) are resolved automatically. Rate cards are matched on the `(sourceZone, destinationZone)` pair. This two-level hierarchy (Area → Zone) allows flexible routing: agents can be assigned to specific areas or entire zones.

## Pricing Engine

Rate cards define B2B and B2C pricing between zone pairs, each with `baseRate`, `ratePerKg`, `minimumCharge`, and `codCharge`. The engine computes:

1. **Volumetric weight:** `(length × breadth × height) / 5000` (if dimensions provided)
2. **Chargeable weight:** `max(actualWeight, volumetricWeight)`
3. **Weight charge:** `chargeableWeight × ratePerKg`
4. **Total:** `baseRate + weightCharge + (COD ? codCharge : 0)`, floored at `minimumCharge`

The selected rate (B2B or B2C) depends on `orderType`. Pricing is calculated automatically during order creation. A standalone estimate endpoint (`POST /api/v1/pricing/estimate`) allows customers to preview costs before ordering.

## Auto Assignment Algorithm

When an admin triggers auto-assignment (`POST /api/v1/orders/:id/auto-assign`):

1. Query agents: `isActive: true`, `status: Available`, `assignedAreas` contains the order's `deliveryArea`.
2. If no direct match, fallback to agents whose `assignedAreas` include any area belonging to the same zone as `deliveryArea`.
3. Among eligible agents, count active orders (statuses: Assigned, Confirmed, PickedUp, InTransit, OutForDelivery).
4. Select the agent with fewest active orders. Tie-break by earliest `createdAt`.
5. Update order to `Assigned` with `assignedAgent` set. Agent status is NOT changed (remains Available).

Manual assignment skips availability checks, allowing admin to assign any active agent. Unassignment reverts the order to `Confirmed`, clears the agent, and sets the agent to `Available`.

If coordinates are added to areas (`location.lat`, `location.lng`), the Haversine formula can rank agents by distance.

## Failed Delivery Workflow

1. Admin marks order as `Failed` via `PATCH /api/v1/orders/:id/fail` with a reason.
2. Delivery attempt counter increments, an entry is pushed to `deliveryHistory`, and the assigned agent is released (status → Available).
3. Customer can reschedule via `PATCH /api/v1/orders/:id/reschedule` with a new date.
4. Reschedule sets status to `Confirmed`, creates tracking events, and triggers auto-assignment to a new eligible agent.

## Security

- **JWT:** 1-hour access tokens, verified on every protected route.
- **Role-based access:** Middleware restricts endpoints to `admin` or `customer` roles.
- **Validation:** Zod schemas validate all request bodies and query parameters.
- **Rate limiting:** 100 requests per 15 minutes per IP on `/api/`.
- **Helmet:** Security headers (CSP, X-Frame-Options, etc.).
- **CORS:** Restricted to `CLIENT_URL`.
- **Password storage:** bcrypt hashing with `select: false` on queries.
- **Sanitization:** `mongo-sanitize` prevents injection attacks.
- **Error handling:** No stack traces in production; consistent JSON error responses.
