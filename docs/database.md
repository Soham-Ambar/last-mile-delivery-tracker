# Database Design

This project is prepared for MongoDB Atlas, but no collections are implemented yet.

## Future Collections

### Users
- Stores application users and roles.
- Planned fields: email, name, passwordHash, role, createdAt, updatedAt.

### Zones
- Stores delivery coverage areas and zone definitions.
- Planned fields: name, region, serviceHours, active.

### Rate Cards
- Stores pricing rules for deliveries.
- Planned fields: rateName, baseFare, perKmCharge, surgeRules, active.

### Orders
- Stores order details and delivery assignments.
- Planned fields: orderId, customerId, origin, destination, status, assignedAgent, createdAt.

### Tracking History
- Stores delivery status updates and location history.
- Planned fields: orderId, status, location, timestamp, notes.

### Agents
- Stores agent profile and availability.
- Planned fields: agentId, name, phone, status, currentAssignment.

## Notes
- Collections will be added once the backend data model phase begins.
- MongoDB Atlas connection is configured through `MONGO_URI`.
