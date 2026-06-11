// Meetup stub. The unrestricted GraphQL API requires a paid Meetup Pro account.
// Wire that up in v2 once we have credentials — for now return [] so seed.ts
// falls back to fixtures.

import type { SourceAdapter } from "./types";

export const meetupAdapter: SourceAdapter = {
  name: "meetup",
  async fetchEvents() {
    return [];
  },
};
