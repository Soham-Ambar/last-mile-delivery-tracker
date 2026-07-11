# Frontend Structure

The frontend application lives in the `client/` folder and is built with React and Vite.

## client/src/

### `components/`
Reusable UI components and shared widgets.

### `pages/`
Page-level components mapped to routes.
Includes placeholders for Home, Login, Register, Dashboard, Admin Dashboard, Agent Dashboard, Customer Dashboard, Orders, Tracking, and NotFound.

### `layouts/`
Shared layout components, including the `Layout` used by all pages.

### `services/`
API clients and external service helpers.

### `hooks/`
Custom React hooks for reusable state and effect logic.

### `context/`
React context providers for application-level state.

### `utils/`
Utility helpers and shared functions.

### `assets/`
Static assets such as images and icons.

## Notes
- Navigation is handled by React Router.
- The shared layout wraps all page routes.
- The project is ready to expand with more pages and functionality.
