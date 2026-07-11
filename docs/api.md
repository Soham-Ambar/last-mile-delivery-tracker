# API Documentation

## Health Check

- Endpoint: `GET /api/v1/health`
- Purpose: Verify that the backend API is running and reachable.
- Request: No request body required.
- Response:
  - `status`: string
  - `message`: string
- Example Response:

```json
{
  "status": "success",
  "message": "API is healthy"
}
```
- Expected Status Code: `200`

## Authentication
- `POST /api/v1/auth/register` — Scaffolded / Not Implemented
- `POST /api/v1/auth/login` — Scaffolded / Not Implemented
- `POST /api/v1/auth/logout` — Scaffolded / Not Implemented
- `GET /api/v1/auth/profile` — Scaffolded / Not Implemented

## Future APIs
- `GET /api/v1/orders` — placeholder for future order listing.
- Additional endpoints will be documented once implemented.
