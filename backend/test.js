const fetch = require('node-fetch');

async function test() {
  try {
    const base = 'http://localhost:5000/api';
    // Test events
    const eventsRes = await fetch(`${base}/events`);
    const events = await eventsRes.json();
    console.log('Events:', events.length);
    // Test spaces
    const spacesRes = await fetch(`${base}/spaces`);
    const spaces = await spacesRes.json();
    console.log('Spaces:', spaces.length);
    // Test waitlist
    const waitlistRes = await fetch(`${base}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const waitlist = await waitlistRes.json();
    console.log('Waitlist response:', waitlist);
    // Test analytics
    const statsRes = await fetch(`${base}/analytics/stats`);
    const stats = await statsRes.json();
    console.log('Stats:', stats);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();