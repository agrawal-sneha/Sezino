const { Events, Spaces } = require('./db');
const fs = require('fs');
const path = require('path');

const eventsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data', 'events.json'), 'utf8'));
const spacesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data', 'spaces.json'), 'utf8'));

async function seed() {
  console.log('Checking existing data...');
  const existingEvents = Events.findAll();
  if (existingEvents.length === 0) {
    console.log('Seeding events...');
    for (const event of eventsData) {
      Events.create(event);
    }
    console.log(`Added ${eventsData.length} events`);
  } else {
    console.log(`Events already exist (${existingEvents.length} records)`);
  }

  const existingSpaces = Spaces.findAll();
  if (existingSpaces.length === 0) {
    console.log('Seeding spaces...');
    for (const space of spacesData) {
      Spaces.create(space);
    }
    console.log(`Added ${spacesData.length} spaces`);
  } else {
    console.log(`Spaces already exist (${existingSpaces.length} records)`);
  }

  console.log('Seeding completed!');
}

seed();