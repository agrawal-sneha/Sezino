// Common shape every source adapter must produce.
// New platforms drop in here without touching ingestion or UI.

export type EventSource = "luma" | "eventbrite" | "meetup";

export interface NormalizedEvent {
  source: EventSource;
  sourceEventId: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  city: string | null;
  hostName: string | null;
  coverImageUrl: string | null;
  externalUrl: string;
  priceLabel: string | null;
  category: string | null;
}

export interface FetchOptions {
  limit?: number;
  city?: string;
}

export interface SourceAdapter {
  name: EventSource;
  fetchEvents(opts?: FetchOptions): Promise<NormalizedEvent[]>;
}
