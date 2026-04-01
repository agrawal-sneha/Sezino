const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT,
  name TEXT,
  avatar TEXT,
  provider TEXT DEFAULT 'email',
  providerId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, providerId)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  fullDate TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  hostName TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  tags TEXT NOT NULL,
  price TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  gradient TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  userAgent TEXT,
  referrer TEXT,
  ip TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Migrate existing users table to add provider columns
try {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const columnNames = columns.map(c => c.name);
  
  if (!columnNames.includes('provider')) {
    db.exec("ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'email'");
    console.log('Added provider column to users table');
  }
  
  if (!columnNames.includes('providerId')) {
    db.exec("ALTER TABLE users ADD COLUMN providerId TEXT");
    console.log('Added providerId column to users table');
  }
  
  // Add unique constraint if not exists (SQLite doesn't support ADD CONSTRAINT directly)
  // We'll handle uniqueness in application logic
} catch (error) {
  console.error('Migration error:', error);
}

// Helper to parse JSON strings
function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

// Events
const Events = {
  findAll() {
    const rows = db.prepare('SELECT * FROM events ORDER BY id').all();
    return rows.map(row => ({
      ...row,
      tags: parseJSON(row.tags)
    }));
  },
  findById(id) {
    const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (row) {
      row.tags = parseJSON(row.tags);
    }
    return row;
  },
  findByUserId(userId) {
    const rows = db.prepare('SELECT * FROM events WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    return rows.map(row => ({
      ...row,
      tags: parseJSON(row.tags)
    }));
  },
  create(event) {
    const stmt = db.prepare(`
      INSERT INTO events (title, date, fullDate, time, location, address, hostName, description, image, tags, price, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      event.title,
      event.date,
      event.fullDate,
      event.time,
      event.location,
      event.address,
      event.hostName,
      event.description,
      event.image,
      JSON.stringify(event.tags || []),
      event.price,
      event.userId || null
    );
    return { id: result.lastInsertRowid };
  },
  update(id, event) {
    const stmt = db.prepare(`
      UPDATE events SET
        title = ?, date = ?, fullDate = ?, time = ?, location = ?, address = ?,
        hostName = ?, description = ?, image = ?, tags = ?, price = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      event.title,
      event.date,
      event.fullDate,
      event.time,
      event.location,
      event.address,
      event.hostName,
      event.description,
      event.image,
      JSON.stringify(event.tags || []),
      event.price,
      id
    );
  },
  delete(id) {
    db.prepare('DELETE FROM events WHERE id = ?').run(id);
  }
};

// Users
const Users = {
  async create(user) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    const stmt = db.prepare(`
      INSERT INTO users (email, passwordHash, name, avatar, provider, providerId)
      VALUES (?, ?, ?, ?, 'email', NULL)
    `);
    const result = stmt.run(user.email, passwordHash, user.name || null, user.avatar || null);
    return { id: result.lastInsertRowid, email: user.email, name: user.name };
  },
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  },
  generateToken(user) {
    const payload = { id: user.id, email: user.email };
    const secret = process.env.JWT_SECRET || 'sezino-secret-key-change-in-production';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return token;
  },
  verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'sezino-secret-key-change-in-production';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  },
  update(id, updates) {
    const allowed = ['name', 'avatar'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    if (fields.length === 0) {
      return { id };
    }
    values.push(id);
    const stmt = db.prepare(`
      UPDATE users SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(...values);
    return { id };
  },
  findByProvider(provider, providerId) {
    return db.prepare('SELECT * FROM users WHERE provider = ? AND providerId = ?').get(provider, providerId);
  },
  createOAuth(user) {
    const stmt = db.prepare(`
      INSERT INTO users (email, name, avatar, provider, providerId, passwordHash)
      VALUES (?, ?, ?, ?, ?, NULL)
    `);
    const result = stmt.run(
      user.email,
      user.name || null,
      user.avatar || null,
      user.provider,
      user.providerId
    );
    return { id: result.lastInsertRowid, email: user.email, name: user.name };
  },
  async findOrCreateOAuth(user) {
    // First try to find by provider + providerId
    let existing = this.findByProvider(user.provider, user.providerId);
    if (existing) {
      return existing;
    }
    // If not found, try to find by email (might be existing user with same email but different provider)
    existing = this.findByEmail(user.email);
    if (existing) {
      // Update existing user with provider info (link accounts)
      // For now, return error - email already exists with different provider
      throw new Error('Email already registered with different authentication method');
    }
    // Create new OAuth user
    return this.createOAuth(user);
  }
};

// Spaces
const Spaces = {
  findAll() {
    const rows = db.prepare('SELECT * FROM spaces ORDER BY id').all();
    return rows.map(row => ({
      ...row,
      keywords: parseJSON(row.keywords)
    }));
  },
  findById(id) {
    const row = db.prepare('SELECT * FROM spaces WHERE id = ?').get(id);
    if (row) {
      row.keywords = parseJSON(row.keywords);
    }
    return row;
  },
  create(space) {
    const stmt = db.prepare(`
      INSERT INTO spaces (id, name, icon, gradient, color, description, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      space.id,
      space.name,
      space.icon,
      space.gradient,
      space.color,
      space.description,
      JSON.stringify(space.keywords || [])
    );
  },
  update(id, space) {
    const stmt = db.prepare(`
      UPDATE spaces SET
        name = ?, icon = ?, gradient = ?, color = ?, description = ?, keywords = ?
      WHERE id = ?
    `);
    stmt.run(
      space.name,
      space.icon,
      space.gradient,
      space.color,
      space.description,
      JSON.stringify(space.keywords || []),
      id
    );
  },
  delete(id) {
    db.prepare('DELETE FROM spaces WHERE id = ?').run(id);
  }
};

// Waitlist
const Waitlist = {
  add(email) {
    try {
      const stmt = db.prepare('INSERT INTO waitlist (email) VALUES (?)');
      stmt.run(email);
      return { success: true };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email already on waitlist');
      }
      throw error;
    }
  },
  getAll() {
    return db.prepare('SELECT * FROM waitlist ORDER BY createdAt DESC').all();
  }
};

// PageViews
const PageViews = {
  add(view) {
    const stmt = db.prepare(`
      INSERT INTO pageviews (path, userAgent, referrer, ip)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(view.path, view.userAgent, view.referrer, view.ip);
  },
  getStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM pageviews').get();
    const today = db.prepare(`
      SELECT COUNT(*) as count FROM pageviews
      WHERE date(createdAt) = date('now')
    `).get();
    const week = db.prepare(`
      SELECT COUNT(*) as count FROM pageviews
      WHERE createdAt >= datetime('now', '-7 days')
    `).get();
    const popularPaths = db.prepare(`
      SELECT path, COUNT(*) as views FROM pageviews 
      GROUP BY path 
      ORDER BY views DESC 
      LIMIT 10
    `).all();
    const referrers = db.prepare(`
      SELECT referrer, COUNT(*) as count FROM pageviews 
      WHERE referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer 
      ORDER BY count DESC 
      LIMIT 10
    `).all();
    return {
      totalVisits: total.count,
      todayVisits: today.count,
      weeklyVisits: week.count,
      popularPaths,
      referrers
    };
  }
};

module.exports = {
  db,
  Events,
  Spaces,
  Waitlist,
  PageViews,
  Users
};