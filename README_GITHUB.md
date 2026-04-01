# Pushing to GitHub

The Sezino codebase has been prepared for GitHub with:
- Git repository initialized
- All files committed
- Remote configured (without authentication)

## Authentication Required

GitHub no longer accepts password authentication for Git operations. You need to create a Personal Access Token (PAT) with `repo` scope.

## Steps to Push

### 1. Create a Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" (classic)
3. Give it a name (e.g., "Sezino Push")
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 2. Push Using the Script

Run the PowerShell script with your token:

```powershell
cd "C:\Users\sneha\.gemini\antigravity\scratch\sezino"
.\push.ps1 -Token "your_token_here"
```

Replace `your_token_here` with the token you copied.

### 3. Alternative: Manual Push

If the script doesn't work, manually set remote and push:

```bash
git remote remove origin
git remote add origin https://agrawal-sneha:YOUR_TOKEN@github.com/agrawal-sneha/sezino.git
git push -u origin main
```

## Repository Structure

- `/` - React frontend (Vite)
- `/backend` - Node.js/Express API with SQLite
- `/src` - React components and pages
- `/public` - Static assets

## Features Implemented

✅ Full backend API (events, spaces, waitlist, analytics)
✅ JWT authentication with email/password
✅ Google OAuth (mock/real)
✅ Apple Sign In (mock)
✅ Frontend-backend integration
✅ Database seeding
✅ Analytics tracking
✅ User profile management
✅ Event creation/update/delete with ownership

## Next Steps After Push

1. Deploy backend to Render/Railway/Vercel
2. Update frontend API base URL to deployed backend
3. Configure environment variables for OAuth
4. Set up production database

## Notes

- The backend currently uses SQLite (file: `backend/database.sqlite`)
- OAuth credentials are not configured (mock endpoints available)
- Update `.env` files with your own credentials for production