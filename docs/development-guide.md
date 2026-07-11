# Development Guide

## Project Setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and update values.
3. Install dependencies for frontend and backend.

## How to Install

- Frontend:
  ```bash
  cd client
  npm install
  ```
- Backend:
  ```bash
  cd server
  npm install
  ```

## How to Run Frontend

```bash
cd client
npm run dev
```

## How to Run Backend

```bash
cd server
npm run dev
```

## Environment Variables

Create a `.env` file with the following keys:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=development`

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your current IP address to the Atlas network access list.
4. Copy the connection string and set it as `MONGO_URI` in `.env`.
5. Confirm the backend connects successfully when starting the server.

## Folder Conventions

- `client/` holds the frontend application.
- `server/` holds the backend API.
- `docs/` holds documentation artifacts.
- `mongodb/` holds database scripts and initialization plans.

## Branch Naming

Use descriptive branch names such as:
- `feature/navigation`
- `feature/docs`
- `feature/backend-foundation`
- `fix/router-paths`

## Code Style

- Keep components small and focused.
- Use React Router for client navigation.
- Keep backend routes and controllers separated.
- Use environment variables for configuration.
- Avoid adding authentication or business logic in the foundation phase.

## Future Development Workflow

1. Complete foundation verification.
2. Add authentication and authorization.
3. Implement database models and validation.
4. Build order and tracking APIs.
5. Add role-based dashboards and workflows.
6. Add tests and deployment configuration.
