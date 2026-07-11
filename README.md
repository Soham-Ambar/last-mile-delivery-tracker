# Last Mile Delivery Tracker

## Project Overview
Last Mile Delivery Tracker is the foundation for a delivery operations platform designed to support drivers, dispatchers, and customers with modern route tracking and order management.

## Features
- Placeholder frontend pages for Home, Login, Register, Dashboard, Admin Dashboard, Agent Dashboard, Customer Dashboard, Orders, and Tracking
- Shared React layout and responsive navigation
- Express backend API with health check endpoint
- MongoDB Atlas-ready database configuration
- Clean project structure for frontend and backend development

## Current Progress
- Foundation phase complete
- Backend architecture and health endpoint verified
- Frontend build and routing verified
- Documentation and developer experience improved

## Project Structure
- `client/` — React + Vite frontend code
- `server/` — Express API backend
- `docs/` — Project and architecture documentation
- `mongodb/` — MongoDB helper scripts and initialization guidance
- `progress.md` — Project status and verification log

## Technology Stack
- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB Atlas (Mongoose-ready configuration)
- API: REST-style endpoints

## Installation
1. Clone the repository
2. Create `.env` from `.env.example`
3. Install frontend dependencies:
   - `cd client && npm install`
4. Install backend dependencies:
   - `cd server && npm install`

## Running the Application
- Frontend: `cd client && npm run dev`
- Backend: `cd server && npm run dev`

## MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Add your application IP address to the network access list
4. Copy the cluster connection string and set it in `.env` as `MONGO_URI`

## Folder Structure
- `client/`
  - `src/pages/` — route page components
  - `src/layouts/` — shared layout and navigation
  - `src/services/` — API client and shared service helpers
  - `src/hooks/` — custom React hooks
  - `src/context/` — React context providers
  - `src/utils/` — utility helpers

- `server/`
  - `config/` — environment and database bootstrapping
  - `controllers/` — request handler logic
  - `routes/` — API route definitions
  - `middleware/` — error handling and request middleware
  - `services/` — backend service helpers
  - `utils/` — reusable helpers and response helpers
  - `validators/` — request validation stubs
  - `constants/` — shared constant values

## API Documentation
- `GET /api/v1/health` — health check endpoint

## Future Roadmap
- Authentication and user role management
- Real database models and validation
- Orders and tracking APIs
- Admin, agent, and customer workflows
- Notifications and performance optimizations

## Contributors
- Project foundation prepared in the Last Mile Delivery Tracker workspace
