# Sezino Event Platform

A full-stack event discovery platform built with React (frontend) and Node.js/Express with PostgreSQL (backend). Features user authentication, event management, spaces categorization, waitlist, and analytics.

## Tech Stack

### Frontend
- React 18 with Vite
- CSS modules for styling
- Responsive design

### Backend
- Node.js with Express
- PostgreSQL database with Prisma ORM
- JWT authentication (email/password, Google OAuth, Apple Sign In)
- REST API

## Features

- **Event Discovery**: Browse events with filtering by spaces/categories
- **Authentication**: Email/password, Google OAuth, Apple Sign In
- **User Dashboard**: Create, update, delete your events
- **Spaces**: Different event categories (Music, Art, Food, etc.)
- **Waitlist**: Join waitlist for upcoming features
- **Analytics**: Track page views and popular paths
- **Responsive Design**: Mobile-first approach

## Project Structure

```
sezino/
├── backend/           # Node.js/Express backend with PostgreSQL
│   ├── prisma/       # Prisma schema and migrations
│   ├── seed-data/    # Sample events and spaces data
│   └── index.js      # Main server file
├── src/              # React frontend
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components (Home, Events, etc.)
│   ├── services/     # API service functions
│   └── styles/       # CSS styles
└── public/           # Static assets
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for local PostgreSQL) **OR** a cloud PostgreSQL database

### 1. Clone and install
```bash
git clone https://github.com/agrawal-sneha/Sezino.git
cd Sezino
npm install
cd backend
npm install
```

### 2. Set up PostgreSQL database

#### Option A: Local PostgreSQL with Docker (recommended for development)
```bash
cd backend
npm run db:up            # Starts PostgreSQL container
npm run db:push          # Creates database tables
npm run seed             # Seeds sample data
```

#### Option B: Cloud PostgreSQL
1. Create a PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or similar.
2. Copy the connection string
3. Update `DATABASE_URL` in `backend/.env` with your connection string.
4. Run migrations and seed:
```bash
cd backend
npm run db:push
npm run seed
```

### 3. Start the backend server
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

### 4. Start the frontend development server
```bash
cd ..
npm run dev
```
Frontend runs on http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example` for reference:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sezino?sslmode=disable"
JWT_SECRET="your-jwt-secret-key-change-in-production"
PORT=5000
# OAuth variables (optional)
```

### Frontend
Frontend API base URL is configured in `src/services/api.js` (default: `http://localhost:5000/api`)

## API Documentation

See `backend/README.md` for detailed API endpoints.

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