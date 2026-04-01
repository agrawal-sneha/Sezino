# Sezino Backend

Node.js/Express backend for Sezino event platform with PostgreSQL and Prisma ORM.

## Features

- REST API for events, spaces, waitlist, and analytics
- PostgreSQL database with Prisma ORM
- JWT authentication with email/password, Google OAuth, and Apple Sign In
- CORS enabled
- Seed data for events and spaces
- Docker Compose for local PostgreSQL

## Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for local PostgreSQL) **OR** a cloud PostgreSQL database (Neon, Supabase, etc.)

### 1. Navigate to backend directory:
```bash
cd sezino/backend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up PostgreSQL database:

#### Option A: Local PostgreSQL with Docker (recommended for development)
```bash
npm run db:up            # Starts PostgreSQL container
npm run db:push          # Creates database tables
npm run seed             # Seeds sample data
```

#### Option B: Cloud PostgreSQL
1. Create a PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or similar.
2. Copy the connection string (looks like `postgresql://user:password@host/dbname?sslmode=require`)
3. Update `DATABASE_URL` in `.env` file with your connection string.
4. Run migrations and seed:
```bash
npm run db:push
npm run seed
```

### 4. Start the development server:
```bash
npm run dev
```
Server runs on http://localhost:5000

## Environment Variables

Create a `.env` file in the backend directory (see `.env.example` if available):

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sezino?sslmode=disable"

# Server
PORT=5000
JWT_SECRET="your-jwt-secret-key-change-in-production"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"

# Apple Sign In (optional)
APPLE_CLIENT_ID=""
APPLE_TEAM_ID=""
APPLE_KEY_ID=""
APPLE_PRIVATE_KEY=""
APPLE_REDIRECT_URI="http://localhost:5000/api/auth/apple/callback"
```

## Available Scripts

- `npm start` – start production server
- `npm run dev` – start development server with nodemon
- `npm run seed` – seed database with sample events and spaces
- `npm run db:up` – start PostgreSQL container (Docker)
- `npm run db:down` – stop PostgreSQL container
- `npm run db:push` – push Prisma schema to database (create tables)
- `npm run db:studio` – open Prisma Studio (database GUI)
- `npm run db:reset` – reset database (delete volumes, recreate, seed)

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

## Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **User** – users with email/password or OAuth providers
- **Event** – events with title, date, location, etc.
- **Space** – event spaces/categories
- **Waitlist** – email waitlist submissions
- **PageView** – analytics page views

## Authentication

### JWT Authentication
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Include `Authorization: Bearer <token>` header for protected routes

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

## Connecting Frontend

The frontend (React/Vite) is already configured to use the backend API. Ensure the backend is running on port 5000.

## Deployment

### Backend Deployment
1. Set up a PostgreSQL database (cloud provider recommended)
2. Configure environment variables (DATABASE_URL, JWT_SECRET, etc.)
3. Deploy to your preferred platform (Railway, Render, Vercel, etc.)

### Frontend Deployment
1. Update `src/services/api.js` to point to your deployed backend URL
2. Deploy to Vercel, Netlify, etc.

## License

MIT