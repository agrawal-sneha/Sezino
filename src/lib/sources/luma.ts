// Luma adapter — calls Luma's public discover API.
// No official API contract; this is best-effort and may break if Luma changes.
// On failure we return [] and the seed pipeline falls back to fixtures.

import type { FetchOptions, NormalizedEvent, SourceAdapter } from "./types";

const LUMA_API = "https://api.lu.ma/discover/get-paginated-events";

interface LumaEntry {
  api_id?: string;
  event?: {
    api_id: string;
    name: string;
    description?: string | null;
    start_at: string;
    end_at?: string | null;
    cover_url?: string | null;
    url: string;
    geo_address_info?: {
      city?: string;
      region?: string;
      address?: string;
      full_address?: string;
    } | null;
    location_type?: string;
  };
  hosts?: Array<{ name?: string; avatar_url?: string }>;
  ticket_info?: {
    is_free?: boolean;
    min_price?: { cents?: number; currency?: string };
  } | null;
  calendar?: { name?: string } | null;
}

interface LumaResponse {
  entries?: LumaEntry[];
  has_more?: boolean;
  next_cursor?: string;
}

export const lumaAdapter: SourceAdapter = {
  name: "luma",
  async fetchEvents({ limit = 40 }: FetchOptions = {}) {
    try {
      const params = new URLSearchParams({ period: "upcoming" });
      const res = await fetch(`${LUMA_API}?${params.toString()}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        console.warn(`[luma] HTTP ${res.status}; returning empty list`);
        return [];
      }
      const data = (await res.json()) as LumaResponse;
      const entries = data.entries ?? [];
      const normalized = entries
        .map(normalizeLumaEntry)
        .filter((e): e is NormalizedEvent => e !== null);
      return normalized.slice(0, limit);
    } catch (err) {
      console.warn("[luma] fetch error:", (err as Error).message);
      return [];
    }
  },
};

function normalizeLumaEntry(entry: LumaEntry): NormalizedEvent | null {
  const ev = entry.event;
  if (!ev?.api_id || !ev.name || !ev.start_at) return null;

  const slug = ev.url ?? "";
  const externalUrl = slug.startsWith("http")
    ? slug
    : `https://lu.ma/${slug}`;

  const geo = ev.geo_address_info ?? null;
  const city = geo?.city ?? null;
  const location =
    geo?.full_address ??
    geo?.address ??
    (ev.location_type === "virtual" ? "Online" : city ?? "TBD");

  let priceLabel: string | null = null;
  if (entry.ticket_info?.is_free) {
    priceLabel = "Free";
  } else if (entry.ticket_info?.min_price?.cents != null) {
    const cents = entry.ticket_info.min_price.cents;
    priceLabel = cents === 0 ? "Free" : `From $${Math.round(cents / 100)}`;
  }

  return {
    source: "luma",
    sourceEventId: ev.api_id,
    title: ev.name,
    description: ev.description ?? null,
    startAt: new Date(ev.start_at),
    endAt: ev.end_at ? new Date(ev.end_at) : null,
    location,
    city,
    hostName: entry.hosts?.[0]?.name ?? entry.calendar?.name ?? null,
    coverImageUrl: ev.cover_url ?? null,
    externalUrl,
    priceLabel,
    category: null,
  };
}
