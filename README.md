
# SmartSeason Field Monitoring System

Live App: https://smartseason-client.vercel.app/  
API: https://smartseason-server.onrender.com/

Frontend Repository: https://github.com/karoshalex0873/smartseason_client  
Backend Repository: https://github.com/karoshalex0873/smartseason_server  .

## Overview
SmartSeason is a field monitoring system designed to help agricultural teams track crop progress, manage field assignments, and monitor risk levels in real time.

The system enables:
- Admin to mange fields, users and asiign agents to fields.
- Agent to update progress and observation on assigned fields.
- Automatic status update (Active ,At Risk, Completed) based on the data 

## System Architecture

- **Frontend:** React (Vite)
- **Backend:** Node.js (Express, TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** HTTP-only cookies with JWT

The frontend communicates with the backend via REST APIs.  
The backend handles business logic, authentication, and database operations.


## Demo Credentials
-Note: the first login may take a moment due to slow sever for free tier hosting. Please be patient when testing the demo.

- Admin: `
Email:admin@smartseason.com
Password: StrongPass1`
- Agent 1: `
Email:agent001@smartseason.com
Password: password123 `

- Agent 2: `
Email:jamal@smartseason.com
Password: password123`


## User Flow
### Admin
- Logs in and is redirected to the admin dashboard.
- Create fields and assign them to agents.
- Create agent users and assign them to fields.
- Monitor field summaries and risk levels.

### Agent
- Logs in and is redirected to the agent dashboard.
- Views assigned fields and their current status.
- Updates field progress and adds notes.
- Views field details and update history.


## Field Status Logic

Field status is automatically computed based on stage and time:

- harvested → completed  
- planted > 14 days → atRisk  
- growing > 90 days → atRisk  
- ready > 120 days → atRisk  
- otherwise → active 


## Design Decisions
- Authentication uses HTTP-only cookies to enhance security by preventing client-side access to tokens.
- Authorization is handled through a combination of authentication checks and role-based guards to ensure proper access control.
- The `Field` model captures the current state of a field, while `FieldUpdate` records historical progress, allowing for a clear separation of concerns.
- Field status is determined by backend business rules based on stage and time, ensuring consistent and accurate monitoring without relying on client-side calculations.
- Admin and Agent Roles are seede and enfored by the backend
- Separion of concerns approach


## Setup

### 1. Clone the repository

```bash
git clone https://github.com/karoshalex0873/smartseason_client.git
cd SmartSeason/client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create `client/.env` with:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start the development server

```bash
npm run dev
```

## Running Scripts
- `npm run dev`: starts the React Router development server
- `npm run build`: builds the production client
- `npm run start`: serves the built client
- `npm run typecheck`: generates route types and runs TypeScript checks

## Design Decisions

- The client is role-aware and redirects users to different dashboards based on the role returned by the backend.
- Authentication relies on backend-issued cookies, so client requests are sent with `credentials: "include"`.
- The admin dashboard focuses on management:
  creating fields, creating users, editing users, and monitoring field summaries.
- The agent dashboard is intentionally narrower:
  agents focus on assigned fields and progress updates.
- The field details page combines current field information with update history so users can see both the latest state and past progress in one place.
- Shared API functions live in a single service file to keep route components focused on UI behavior.
- Shared form and card components are reused to keep the experience consistent across admin, agent, and field detail screens.

## Assumptions

- The backend server is already running and reachable through `VITE_API_URL`.
- Users must be authenticated before accessing dashboard and field pages.
- Admin users are responsible for creating and assigning agent users.
- Agent users do not create fields; they work on fields assigned to them.
- The frontend depends on the backend for role checks, field visibility, and current user state.
- Field status shown in the UI comes from backend business rules, not from client-side calculations.
