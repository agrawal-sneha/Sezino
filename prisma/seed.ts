// Seed script: pulls live events from Luma where possible, otherwise loads
// curated fixtures so the app works offline / on a fresh clone.
//
// Run: `npm run db:seed`

import { PrismaClient } from "@prisma/client";
import { lumaAdapter } from "../src/lib/sources/luma";
import type { NormalizedEvent } from "../src/lib/sources/types";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Sezino…");

  const lumaEvents = await lumaAdapter.fetchEvents({ limit: 30 });
  console.log(`  Luma: pulled ${lumaEvents.length} live events`);

  const fixtures = buildFixtures();
  console.log(`  Fixtures: ${fixtures.length} curated events (Eventbrite + Meetup stubs)`);

  const all = dedupe([...lumaEvents, ...fixtures]);

  let inserted = 0;
  for (const ev of all) {
    await prisma.event.upsert({
      where: {
        source_sourceEventId: {
          source: ev.source,
          sourceEventId: ev.sourceEventId,
        },
      },
      create: ev,
      update: {
        title: ev.title,
        startAt: ev.startAt,
        endAt: ev.endAt,
        location: ev.location,
        coverImageUrl: ev.coverImageUrl,
      },
    });
    inserted++;
  }

  console.log(`Seeded ${inserted} events.`);
}

function dedupe(events: NormalizedEvent[]): NormalizedEvent[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = `${e.source}:${e.sourceEventId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildFixtures(): NormalizedEvent[] {
  const now = Date.now();
  const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);
  const hours = (n: number) => new Date(now + n * 60 * 60 * 1000);

  return [
    // Eventbrite-style fixtures
    {
      source: "eventbrite",
      sourceEventId: "eb-fixture-001",
      title: "SF Tech Founders Mixer",
      description:
        "Monthly happy hour for early-stage founders and the angels who back them. Free drinks, no pitches.",
      startAt: hours(36),
      endAt: hours(40),
      location: "Mission District, San Francisco, CA",
      city: "San Francisco",
      hostName: "Founders Network",
      coverImageUrl:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
      externalUrl: "https://www.eventbrite.com/e/sf-tech-founders-mixer-tickets-000000",
      priceLabel: "Free",
      category: "Networking",
    },
    {
      source: "eventbrite",
      sourceEventId: "eb-fixture-002",
      title: "Generative AI Workshop: Build a RAG Pipeline in 3 Hours",
      description:
        "Hands-on workshop. Bring a laptop. We'll build a document Q&A pipeline using open-source models end-to-end.",
      startAt: days(3),
      endAt: new Date(days(3).getTime() + 3 * 60 * 60 * 1000),
      location: "GitHub HQ, San Francisco, CA",
      city: "San Francisco",
      hostName: "AI Tinkerers",
      coverImageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      externalUrl: "https://www.eventbrite.com/e/generative-ai-workshop-tickets-000001",
      priceLabel: "From $25",
      category: "Workshop",
    },
    {
      source: "eventbrite",
      sourceEventId: "eb-fixture-003",
      title: "Sunday Sound Bath + Mindfulness Brunch",
      description:
        "Slow Sunday. 60-min crystal sound bath followed by a plant-based brunch on the rooftop.",
      startAt: days(5),
      endAt: new Date(days(5).getTime() + 3 * 60 * 60 * 1000),
      location: "Dolores Heights Rooftop, San Francisco, CA",
      city: "San Francisco",
      hostName: "Slow Studio",
      coverImageUrl:
        "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
      externalUrl: "https://www.eventbrite.com/e/sound-bath-brunch-tickets-000002",
      priceLabel: "From $45",
      category: "Wellness",
    },
    // Meetup-style fixtures
    {
      source: "meetup",
      sourceEventId: "mu-fixture-001",
      title: "Bay Area Rust Programmers — Monthly Meetup",
      description:
        "Two lightning talks, demo time, and pizza. This month: async runtimes deep-dive and a WASM live-coding demo.",
      startAt: days(2),
      endAt: new Date(days(2).getTime() + 3 * 60 * 60 * 1000),
      location: "Mozilla SF Office, San Francisco, CA",
      city: "San Francisco",
      hostName: "Bay Area Rust",
      coverImageUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
      externalUrl: "https://www.meetup.com/bay-area-rust/events/000000001/",
      priceLabel: "Free",
      category: "Tech",
    },
    {
      source: "meetup",
      sourceEventId: "mu-fixture-002",
      title: "Sunset Trail Run — Lands End",
      description:
        "Casual 5-mile loop through Lands End. Pace groups for 8/9/10 min miles. Stick around for tacos after.",
      startAt: hours(72),
      endAt: hours(75),
      location: "Lands End Trailhead, San Francisco, CA",
      city: "San Francisco",
      hostName: "SF Run Club",
      coverImageUrl:
        "https://images.unsplash.com/photo-1502224562085-639556652f33?w=800&q=80",
      externalUrl: "https://www.meetup.com/sf-run-club/events/000000002/",
      priceLabel: "Free",
      category: "Fitness",
    },
    {
      source: "meetup",
      sourceEventId: "mu-fixture-003",
      title: "Indie Hackers Coffee Coworking",
      description:
        "No agenda. Bring your laptop and your hardest problem. We'll order from the cafe and grind together.",
      startAt: days(1),
      endAt: new Date(days(1).getTime() + 4 * 60 * 60 * 1000),
      location: "Sightglass Coffee, SoMa, San Francisco, CA",
      city: "San Francisco",
      hostName: "Indie Hackers SF",
      coverImageUrl:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
      externalUrl: "https://www.meetup.com/indiehackers-sf/events/000000003/",
      priceLabel: "Free",
      category: "Coworking",
    },
    {
      source: "meetup",
      sourceEventId: "mu-fixture-004",
      title: "Climbing Night at Dogpatch Boulders",
      description:
        "Meet up at the front desk at 7pm. Beginners welcome — we'll pair you with someone who knows the routes.",
      startAt: days(4),
      endAt: new Date(days(4).getTime() + 2 * 60 * 60 * 1000),
      location: "Dogpatch Boulders, San Francisco, CA",
      city: "San Francisco",
      hostName: "SF Climbers",
      coverImageUrl:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
      externalUrl: "https://www.meetup.com/sf-climbers/events/000000004/",
      priceLabel: "$22",
      category: "Fitness",
    },
    // A couple more eventbrite for good measure
    {
      source: "eventbrite",
      sourceEventId: "eb-fixture-004",
      title: "Live Jazz at the Black Cat",
      description:
        "Weekly trio set in the basement room. Cocktails, low light, no phones policy after 9pm.",
      startAt: days(6),
      endAt: new Date(days(6).getTime() + 3 * 60 * 60 * 1000),
      location: "The Black Cat, Tenderloin, San Francisco, CA",
      city: "San Francisco",
      hostName: "Black Cat",
      coverImageUrl:
        "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
      externalUrl: "https://www.eventbrite.com/e/jazz-black-cat-tickets-000003",
      priceLabel: "From $30",
      category: "Music",
    },
    {
      source: "eventbrite",
      sourceEventId: "eb-fixture-005",
      title: "Design Systems NYC: Tokens, Theming, and Tradeoffs",
      description:
        "Three speakers from Linear, Vercel, and Ramp share what they learned scaling design systems past v1.",
      startAt: days(8),
      endAt: new Date(days(8).getTime() + 2 * 60 * 60 * 1000),
      location: "Cooper Union, New York, NY",
      city: "New York",
      hostName: "Design Systems NYC",
      coverImageUrl:
        "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800&q=80",
      externalUrl: "https://www.eventbrite.com/e/design-systems-nyc-tickets-000004",
      priceLabel: "Free",
      category: "Design",
    },
  ];
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
