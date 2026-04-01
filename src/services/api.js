const API_BASE = 'http://localhost:5000/api';

// Events
export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return await res.json();
}

export async function fetchEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event');
  return await res.json();
}

export async function createEvent(eventData, token) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error('Failed to create event');
  return await res.json();
}

// Spaces
export async function fetchSpaces() {
  const res = await fetch(`${API_BASE}/spaces`);
  if (!res.ok) throw new Error('Failed to fetch spaces');
  return await res.json();
}

export async function fetchSpace(id) {
  const res = await fetch(`${API_BASE}/spaces/${id}`);
  if (!res.ok) throw new Error('Failed to fetch space');
  return await res.json();
}

// Waitlist
export async function addToWaitlist(email) {
  const res = await fetch(`${API_BASE}/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add to waitlist');
  }
  return await res.json();
}

// Analytics
export async function trackPageView(data) {
  const payload = {
    ...data,
    referrer: document.referrer || '',
    ip: ''
  };
  // Don't await to avoid blocking
  fetch(`${API_BASE}/analytics/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => { /* ignore errors */ });
}

export async function getAnalyticsStats() {
  const res = await fetch(`${API_BASE}/analytics/stats`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
}

// Auth
export async function register(email, password, name) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  return await res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return await res.json();
}

export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

// User events
export async function fetchUserEvents(token) {
  const res = await fetch(`${API_BASE}/users/me/events`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user events');
  return await res.json();
}

// Google OAuth
export async function getGoogleAuthUrl() {
  const res = await fetch(`${API_BASE}/auth/google/url`);
  if (!res.ok) throw new Error('Failed to get Google OAuth URL');
  return await res.json();
}

export async function mockGoogleAuth() {
  const res = await fetch(`${API_BASE}/auth/google/mock`);
  if (!res.ok) throw new Error('Failed to authenticate with Google (mock)');
  return await res.json();
}

export async function mockAppleAuth() {
  const res = await fetch(`${API_BASE}/auth/apple/mock`);
  if (!res.ok) throw new Error('Failed to authenticate with Apple (mock)');
  return await res.json();
}