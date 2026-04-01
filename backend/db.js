const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

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
  async findAll() {
    const rows = await prisma.event.findMany({
      orderBy: { id: 'asc' }
    });
    return rows.map(row => ({
      ...row,
      tags: parseJSON(row.tags)
    }));
  },
  async findById(id) {
    const row = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });
    if (row) {
      row.tags = parseJSON(row.tags);
    }
    return row;
  },
  async findByUserId(userId) {
    const rows = await prisma.event.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map(row => ({
      ...row,
      tags: parseJSON(row.tags)
    }));
  },
  async create(event) {
    const newEvent = await prisma.event.create({
      data: {
        title: event.title,
        date: event.date,
        fullDate: event.fullDate,
        time: event.time,
        location: event.location,
        address: event.address,
        hostName: event.hostName,
        description: event.description,
        image: event.image,
        tags: JSON.stringify(event.tags || []),
        price: event.price,
        userId: event.userId ? parseInt(event.userId) : null
      }
    });
    return { id: newEvent.id };
  },
  async update(id, event) {
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title: event.title,
        date: event.date,
        fullDate: event.fullDate,
        time: event.time,
        location: event.location,
        address: event.address,
        hostName: event.hostName,
        description: event.description,
        image: event.image,
        tags: JSON.stringify(event.tags || []),
        price: event.price,
        updatedAt: new Date()
      }
    });
  },
  async delete(id) {
    await prisma.event.delete({
      where: { id: parseInt(id) }
    });
  }
};

// Users
const Users = {
  async create(user) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        name: user.name || null,
        avatar: user.avatar || null,
        provider: 'email',
        providerId: null
      }
    });
    return { id: newUser.id, email: newUser.email, name: newUser.name };
  },
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
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
  async update(id, updates) {
    const allowed = ['name', 'avatar'];
    const data = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        data[key] = updates[key];
      }
    }
    if (Object.keys(data).length === 0) {
      return { id };
    }
    await prisma.user.update({
      where: { id: parseInt(id) },
      data
    });
    return { id };
  },
  async findByProvider(provider, providerId) {
    return await prisma.user.findFirst({
      where: {
        provider,
        providerId
      }
    });
  },
  async createOAuth(user) {
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name || null,
        avatar: user.avatar || null,
        provider: user.provider,
        providerId: user.providerId,
        passwordHash: null
      }
    });
    return { id: newUser.id, email: newUser.email, name: newUser.name };
  },
  async findOrCreateOAuth(user) {
    // First try to find by provider + providerId
    let existing = await this.findByProvider(user.provider, user.providerId);
    if (existing) {
      return existing;
    }
    // If not found, try to find by email (might be existing user with same email but different provider)
    existing = await this.findByEmail(user.email);
    if (existing) {
      // Update existing user with provider info (link accounts)
      // For now, return error - email already exists with different provider
      throw new Error('Email already registered with different authentication method');
    }
    // Create new OAuth user
    return await this.createOAuth(user);
  }
};

// Spaces
const Spaces = {
  async findAll() {
    const rows = await prisma.space.findMany({
      orderBy: { id: 'asc' }
    });
    return rows.map(row => ({
      ...row,
      keywords: parseJSON(row.keywords)
    }));
  },
  async findById(id) {
    const row = await prisma.space.findUnique({
      where: { id }
    });
    if (row) {
      row.keywords = parseJSON(row.keywords);
    }
    return row;
  },
  async create(space) {
    await prisma.space.create({
      data: {
        id: space.id,
        name: space.name,
        icon: space.icon,
        gradient: space.gradient,
        color: space.color,
        description: space.description,
        keywords: JSON.stringify(space.keywords || [])
      }
    });
  },
  async update(id, space) {
    await prisma.space.update({
      where: { id },
      data: {
        name: space.name,
        icon: space.icon,
        gradient: space.gradient,
        color: space.color,
        description: space.description,
        keywords: JSON.stringify(space.keywords || [])
      }
    });
  },
  async delete(id) {
    await prisma.space.delete({
      where: { id }
    });
  }
};

// Waitlist
const Waitlist = {
  async add(email) {
    try {
      await prisma.waitlist.create({
        data: { email }
      });
      return { success: true };
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint violation
        throw new Error('Email already on waitlist');
      }
      throw error;
    }
  },
  async getAll() {
    return await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
};

// PageViews
const PageViews = {
  async add(view) {
    await prisma.pageView.create({
      data: {
        path: view.path,
        userAgent: view.userAgent,
        referrer: view.referrer,
        ip: view.ip
      }
    });
  },
  async getStats() {
    const total = await prisma.pageView.count();
    const today = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const week = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    const popularPaths = await prisma.pageView.groupBy({
      by: ['path'],
      _count: {
        path: true
      },
      orderBy: {
        _count: {
          path: 'desc'
        }
      },
      take: 10
    });
    const referrers = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        referrer: {
          not: null,
          not: ''
        }
      },
      _count: {
        referrer: true
      },
      orderBy: {
        _count: {
          referrer: 'desc'
        }
      },
      take: 10
    });
    return {
      totalVisits: total,
      todayVisits: today,
      weeklyVisits: week,
      popularPaths: popularPaths.map(p => ({ path: p.path, views: p._count.path })),
      referrers: referrers.map(r => ({ referrer: r.referrer, count: r._count.referrer }))
    };
  }
};

module.exports = {
  db: prisma,
  Events,
  Spaces,
  Waitlist,
  PageViews,
  Users
};