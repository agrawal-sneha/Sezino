# Sezino

Tinder-style aggregator for Luma, Eventbrite, and Meetup events. Sign in with your email, swipe through what's on this week, RSVP through the source platform with one tap.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite (swap to Postgres via `DATABASE_URL`)
- NextAuth (email magic link — console transport in dev, Resend in prod)
- Tailwind + framer-motion for the swipe deck
- Source adapter pattern in `src/lib/sources/` — Luma calls the real public API; Eventbrite + Meetup are stubs (see notes below)

## Run it

```bash
npm install
npm run db:push     # creates SQLite schema
npm run db:seed     # pulls live Luma events + loads fixtures
npm run dev
```

Open http://localhost:3000, click **Sign in**, drop in any email — the magic link is printed in your terminal.

## Source ingestion notes

- **Luma**: `src/lib/sources/luma.ts` calls `https://api.lu.ma/discover/get-paginated-events`. Unofficial endpoint — best-effort. If it 4xx/5xx's, the seed script falls back to fixtures.
- **Eventbrite**: stub. Their general `/v3/events/search/` API was deprecated in 2020. Real ingestion requires either an organizer-side OAuth (your own events) or scraping JSON-LD from their public event pages — both deferred.
- **Meetup**: stub. Their unrestricted GraphQL API requires a paid Meetup Pro account (~$200/mo). Wire up once we have credentials.

To replace a stub: implement `SourceAdapter` from `src/lib/sources/types.ts` and add it to `prisma/seed.ts`.

## What's next

- **Real Eventbrite + Meetup ingestion** (see notes above)
- **Notifications**: email + push when a saved event is starting soon, or when a host approves the RSVP
- **Taste model**: rank the discover feed using past swipes (right now it's just `startAt ASC`)
- **City filter**: nav-level city picker; ingestion already captures `city` per event
- **Deep RSVP**: for sources that allow it, do the RSVP through Sezino instead of deep-linking out (this is where the "better access" business angle would live — partnerships first, code second)
