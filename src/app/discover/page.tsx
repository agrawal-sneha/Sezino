import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav } from "@/components/nav";
import { SwipeDeck } from "@/components/swipe-deck";
import { Providers } from "@/app/providers";
import type { EventCardData } from "@/components/event-card";

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  // Pull events the user hasn't swiped on yet, soonest first.
  const swiped = await prisma.swipe.findMany({
    where: { userId: session.user.id },
    select: { eventId: true },
  });
  const swipedIds = swiped.map((s) => s.eventId);

  const events = await prisma.event.findMany({
    where: {
      startAt: { gte: new Date() },
      id: { notIn: swipedIds.length > 0 ? swipedIds : undefined },
    },
    orderBy: { startAt: "asc" },
    take: 30,
  });

  const cards: EventCardData[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startAt: e.startAt.toISOString(),
    location: e.location,
    hostName: e.hostName,
    coverImageUrl: e.coverImageUrl,
    externalUrl: e.externalUrl,
    source: e.source,
    priceLabel: e.priceLabel,
    category: e.category,
  }));

  return (
    <Providers>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            What's on this week
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cards.length} events queued · swipe right to save
          </p>
        </div>
        <SwipeDeck initialEvents={cards} />
      </main>
    </Providers>
  );
}
