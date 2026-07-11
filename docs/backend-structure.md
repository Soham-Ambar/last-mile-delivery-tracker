# Backend Structure

The backend application lives in the `server/` folder and is built with Express.

## server/

### `controllers/`
Route handlers and controller logic for API endpoints.

### `models/`
Database model definitions (planned for future development).

### `routes/`
Defines API route mappings and route-level middleware.

### `middleware/`
Express middleware functions, such as error handling.

### `config/`
Environment and database bootstrapping logic.

### `services/`
Reusable backend service helpers and integration logic.

### `utils/`
Utility helpers, response helpers, and common functions.

### `validators/`
Request validation and payload validation helpers.

### `constants/`
Shared constant values used across the server.

## Notes
- The backend foundation is configured with a health endpoint and database bootstrapping.
- Additional controllers and models will be added during the next phase.
