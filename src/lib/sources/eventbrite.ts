// Eventbrite stub. The general /v3/events/search/ API was deprecated in 2020;
// real ingestion needs an org partnership or scraping their structured JSON-LD.
// Wire that up in v2 — for now, return [] so seed.ts uses fixtures.

import type { SourceAdapter } from "./types";

export const eventbriteAdapter: SourceAdapter = {
  name: "eventbrite",
  async fetchEvents() {
    return [];
  },
};
