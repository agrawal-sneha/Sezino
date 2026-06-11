"use client";

import Image from "next/image";
import { Calendar, MapPin, Tag, ExternalLink } from "lucide-react";
import { cn, formatEventDate, sourceColor, sourceLabel } from "@/lib/utils";

export interface EventCardData {
  id: string;
  title: string;
  description: string | null;
  startAt: string; // ISO
  location: string | null;
  hostName: string | null;
  coverImageUrl: string | null;
  externalUrl: string;
  source: string;
  priceLabel: string | null;
  category: string | null;
}

export function EventCard({
  event,
  className,
  showRsvpLink = false,
}: {
  event: EventCardData;
  className?: string;
  showRsvpLink?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-card border border-border shadow-2xl shadow-black/40 select-none",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur",
              sourceColor(event.source),
            )}
          >
            {sourceLabel(event.source)}
          </span>
          {event.priceLabel && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white border border-white/20 backdrop-blur">
              {event.priceLabel}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
          <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
            {event.title}
          </h2>

          <div className="flex flex-col gap-1.5 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formatEventDate(event.startAt)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.hostName && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 shrink-0" />
                <span className="truncate">Hosted by {event.hostName}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-white/80 line-clamp-2 leading-snug">
              {event.description}
            </p>
          )}

          {showRsvpLink && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
            >
              RSVP on {sourceLabel(event.source)}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
