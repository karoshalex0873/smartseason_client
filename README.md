# SmartSeason Client
A modern React frontend for the SmartSeason Field Monitoring System.

## Overview
This client application provides a user interface for both `Admin` and `Agent` users to interact with the SmartSeason backend API. It supports:
- user authentication
- role-based dashboards
- field management
- stage tracking
- responsive design
The project is built with:
- `React`
- `TypeScript`
- `React Router`
- `Tailwind CSS`

## Environment Variables
Create a `.env` file in the `client` folder. Example:
```VITE_API_URL=http://localhost:3000
```
Notes:
- The `VITE_` prefix is required for environment variables in Vite.
- Set `VITE_API_URL` to your backend API URL (e.g., `` for production).


### Credentials for testing:
- Admin: `
  - email: `admin@smartseason.com`
  - password: `StrongPass1`

- Agent 2: `
  - email: `jamal@smartseason.com`
  - password: `password123`
- Agent 1: `
  - email: `agent001@smartseason.com`
  - password: `password123`


### Business Logic
The client application implements the following features:
1. **Authentication**: Users can sign in and sign out. The client stores authentication tokens in `httpOnly` cookies and uses them for authenticated API requests.
2. **Role-Based Dashboards**: After signing in, users are redirected to either the Admin or Agent dashboard based on their role.
3. **Field Management**: Admins can create, update, and delete fields, while Agents can view and update assigned fields.
4. **Stage Tracking**: it include updating stage (e.g., planting, growing, harvesting) and adding notes for each stage.
  <!-- auto status -->
  **Automatic Status Computation logic**:
  - Basically tracks if the crop has taken too long in a stage and flags it as "At Risk" if it exceeds typical duration thresholds. if the crop takes too long in a stage say 30days since planted yet not in growing stage then it is flagged as "At Risk". it has taken too long to germinate.
5. **Responsive Design**: The UI is designed to be responsive and user-friendly across different devices.

