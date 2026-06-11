import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Tomorrow · ${time}`;
  if (diffDays > 1 && diffDays < 7) {
    return `${d.toLocaleDateString("en-US", { weekday: "long" })} · ${time}`;
  }
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} · ${time}`;
}

export function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    luma: "Luma",
    eventbrite: "Eventbrite",
    meetup: "Meetup",
  };
  return labels[source] ?? source;
}

export function sourceColor(source: string): string {
  const colors: Record<string, string> = {
    luma: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    eventbrite: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    meetup: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return colors[source] ?? "bg-muted text-muted-foreground border-border";
}
