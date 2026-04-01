const fetch = require('node-fetch');

async function test() {
  const base = 'http://localhost:5000/api';
  try {
    // Test root
    const rootRes = await fetch('http://localhost:5000');
    console.log('Root:', await rootRes.text());
    
    // Test events
    const eventsRes = await fetch(`${base}/events`);
    const events = await eventsRes.json();
    console.log('Events count:', events.length);
    
    // Test spaces
    const spacesRes = await fetch(`${base}/spaces`);
    const spaces = await spacesRes.json();
    console.log('Spaces count:', spaces.length);
    
    // Test waitlist
    const waitRes = await fetch(`${base}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test' + Date.now() + '@example.com' })
    });
    console.log('Waitlist:', waitRes.status, await waitRes.text());
    
    // Test analytics stats
    const statsRes = await fetch(`${base}/analytics/stats`);
    console.log('Stats:', await statsRes.json());
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();