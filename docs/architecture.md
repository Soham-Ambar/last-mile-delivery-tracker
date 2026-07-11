# Architecture Notes

## Overview
This project is structured as a modular full-stack application with a Vite React frontend and an Express backend API.

## Frontend
- React Router handles page-level navigation.
- Page components live in src/pages.
- Shared UI shells and navigation live in src/layouts.
- API access is centralized via src/services/api.ts.

## Backend
- Express exposes a REST-style API and a health endpoint.
- MongoDB connection logic is bootstrapped in server/server.js.
- Future controllers, models, middleware, and routes will be organized by responsibility.
