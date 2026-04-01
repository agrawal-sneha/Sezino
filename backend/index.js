const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Events, Spaces, Waitlist, PageViews, Users } = require('./db');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next(); // No token, but not required for all routes
  }
  const user = Users.verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  req.user = user;
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

app.use(authenticateToken);

app.get('/', (req, res) => {
  res.json({ message: 'Sezino Backend API' });
});

// Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Events.findAll();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Events.findById(parseInt(req.params.id));
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

app.post('/api/events', requireAuth, async (req, res) => {
  try {
    const { title, date, fullDate, time, location, address, hostName, description, image, tags, price } = req.body;
    // Validation
    if (!title || !date || !fullDate || !time || !location || !address || !hostName || !description || !image || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const tagArray = Array.isArray(tags) ? tags : [];
    const newEvent = { title, date, fullDate, time, location, address, hostName, description, image, tags: tagArray, price, userId: req.user.id };
    const result = await Events.create(newEvent);
    res.status(201).json({ id: result.id, ...newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
app.put('/api/events/:id', requireAuth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }
    const { title, date, fullDate, time, location, address, hostName, description, image, tags, price } = req.body;
    // Validation (same as create)
    if (!title || !date || !fullDate || !time || !location || !address || !hostName || !description || !image || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const tagArray = Array.isArray(tags) ? tags : [];
    const updatedEvent = { title, date, fullDate, time, location, address, hostName, description, image, tags: tagArray, price };
    await Events.update(eventId, updatedEvent);
    res.json({ id: eventId, ...updatedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', requireAuth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    await Events.delete(eventId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Spaces
app.get('/api/spaces', async (req, res) => {
  try {
    const spaces = await Spaces.findAll();
    res.json(spaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

app.get('/api/spaces/:id', async (req, res) => {
  try {
    const space = await Spaces.findById(req.params.id);
    if (space) {
      res.json(space);
    } else {
      res.status(404).json({ error: 'Space not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch space' });
  }
});

// Waitlist
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    await Waitlist.add(email);
    res.status(201).json({ success: true, message: 'Added to waitlist' });
  } catch (error) {
    if (error.message.includes('already on waitlist')) {
      return res.status(409).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to add to waitlist' });
  }
});

// Analytics tracking
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    const { path, userAgent, referrer, ip } = req.body;
    await PageViews.add({ path, userAgent, referrer, ip });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record pageview' });
  }
});

app.get('/api/analytics/stats', async (req, res) => {
  try {
    const stats = await PageViews.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    // Check if user exists
    const existing = await Users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const user = await Users.create({ email, password, name });
    const token = Users.generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await Users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await Users.verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = Users.generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return safe fields
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Google OAuth
app.get('/api/auth/google/url', (req, res) => {
  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email']
    });
    res.json({ url });
  } catch (error) {
    console.error('Google OAuth URL error:', error);
    res.status(500).json({ error: 'Failed to generate Google OAuth URL' });
  }
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: providerId, email, name, picture } = payload;

    // Find or create user
    const user = await Users.findOrCreateOAuth({
      provider: 'google',
      providerId,
      email,
      name,
      avatar: picture
    });

    const token = Users.generateToken(user);
    // Return safe user fields
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Google OAuth error:', error);
    if (error.message.includes('already registered')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Google authentication failed' });
  }
});

// Mock Google OAuth for development (when GOOGLE_CLIENT_ID is not set)
app.get('/api/auth/google/mock', async (req, res) => {
  try {
    if (process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ error: 'Mock endpoint disabled when Google OAuth is configured' });
    }
    
    const mockUser = {
      provider: 'google',
      providerId: 'mock-google-' + Date.now(),
      email: 'mock.user@example.com',
      name: 'Mock Google User',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    };
    
    const user = await Users.findOrCreateOAuth(mockUser);
    const token = Users.generateToken(user);
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Mock Google OAuth error:', error);
    res.status(500).json({ error: error.message || 'Mock authentication failed' });
  }
});

// Apple Sign In
app.post('/api/auth/apple/callback', async (req, res) => {
  try {
    const { identityToken, email, name } = req.body;
    if (!identityToken) {
      return res.status(400).json({ error: 'Identity token required' });
    }

    // Verify Apple identity token (placeholder)
    // In production, verify JWT using Apple's public keys
    // For now, we'll accept the token and create user if email provided
    // This is NOT secure - implement proper verification for production
    res.status(501).json({ error: 'Apple Sign In not yet implemented. Use email/password or Google OAuth.' });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({ error: error.message || 'Apple authentication failed' });
  }
});

// Mock Apple Sign In for development
app.get('/api/auth/apple/mock', async (req, res) => {
  try {
    const mockUser = {
      provider: 'apple',
      providerId: 'mock-apple-' + Date.now(),
      email: 'mock.apple@example.com',
      name: 'Mock Apple User',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    };
    
    const user = await Users.findOrCreateOAuth(mockUser);
    const token = Users.generateToken(user);
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Mock Apple OAuth error:', error);
    res.status(500).json({ error: error.message || 'Mock authentication failed' });
  }
});

// User events
app.get('/api/users/me/events', requireAuth, async (req, res) => {
  try {
    const events = await Events.findByUserId(req.user.id);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

// Update user profile
app.put('/api/users/me', requireAuth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    await Users.update(req.user.id, { name, avatar });
    // Fetch updated user
    const user = await Users.findById(req.user.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});