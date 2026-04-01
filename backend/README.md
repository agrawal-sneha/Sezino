# Sezino Backend

Node.js/Express backend for Sezino event platform.

## Features

- REST API for events, spaces, waitlist, and analytics
- SQLite database with better-sqlite3
- CORS enabled
- Seed data for events and spaces

## Setup

1. Navigate to backend directory:
   ```bash
   cd sezino/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with sample events and spaces:
   ```bash
   npm run seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

## API Endpoints

### Events
- `GET /api/events` – list all events
- `GET /api/events/:id` – get single event
- `POST /api/events` – create new event (requires authentication)
- `PUT /api/events/:id` – update event (requires ownership)
- `DELETE /api/events/:id` – delete event (requires ownership)

### Spaces
- `GET /api/spaces` – list all spaces
- `GET /api/spaces/:id` – get single space

### Waitlist & Analytics
- `POST /api/waitlist` – add email to waitlist
- `POST /api/analytics/pageview` – record page view
- `GET /api/analytics/stats` – get basic analytics

### Authentication
- `POST /api/auth/register` – register with email/password
- `POST /api/auth/login` – login with email/password
- `GET /api/auth/me` – get current user (requires token)
- `GET /api/auth/google/url` – get Google OAuth URL
- `GET /api/auth/google/callback` – Google OAuth callback
- `POST /api/auth/apple/callback` – Apple Sign In callback
- `GET /api/auth/google/mock` – mock Google OAuth (dev)
- `GET /api/auth/apple/mock` – mock Apple Sign In (dev)

### User
- `GET /api/users/me/events` – get user's created events
- `PUT /api/users/me` – update user profile

## Connecting Frontend

The frontend (React/Vite) currently uses local mock data. To connect to the backend:

1. Update `src/data/events.js` and `src/data/spaces.js` to fetch from backend API instead of exporting hardcoded arrays.

2. Create a service module (e.g., `src/services/api.js`):

   ```javascript
   const API_BASE = 'http://localhost:5000/api';

   export async function fetchEvents() {
     const res = await fetch(`${API_BASE}/events`);
     return await res.json();
   }

   export async function fetchSpaces() {
     const res = await fetch(`${API_BASE}/spaces`);
     return await res.json();
   }

   export async function addToWaitlist(email) {
     const res = await fetch(`${API_BASE}/waitlist`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email })
     });
     return await res.json();
   }
   ```

3. Replace imports in components:

   - In `Home.jsx`, replace `import { events } from '../data/events'` with `import { fetchEvents } from '../services/api'` and call inside `useEffect`.
   - Similarly for spaces.

4. Update the embedding service to run on server side (optional).

## Authentication

JWT-based authentication is implemented with the following endpoints:

- `POST /api/auth/register` – register new user (email/password)
- `POST /api/auth/login` – login with email/password  
- `GET /api/auth/me` – get current user (requires Bearer token)
- `PUT /api/users/me` – update user profile (name, avatar)

### OAuth Authentication

Google OAuth and Apple Sign In are supported via mock endpoints for development. To enable real OAuth:

#### Google OAuth Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable OAuth 2.0 API and create credentials (OAuth 2.0 Client ID)
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Set environment variables in `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

#### Apple Sign In Setup
1. Enroll in [Apple Developer Program](https://developer.apple.com)
2. Create an App ID and enable Sign in with Apple
3. Generate a private key and obtain Key ID, Team ID
4. Set environment variables in `.env`:
   ```
   APPLE_CLIENT_ID=com.example.app (service ID)
   APPLE_TEAM_ID=your_team_id
   APPLE_KEY_ID=your_key_id
   APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
   APPLE_REDIRECT_URI=http://localhost:5000/api/auth/apple/callback
   ```

### Mock OAuth (Development)
When OAuth credentials are not set, mock endpoints are available:
- `GET /api/auth/google/mock` – creates a mock Google user
- `GET /api/auth/apple/mock` – creates a mock Apple user

These return valid JWT tokens for testing.

## Database Schema

See `db.js` for table definitions. The SQLite database file is `database.sqlite`.

## Development

- Use `npm run dev` for development with nodemon.
- Use `npm start` for production.