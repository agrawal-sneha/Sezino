import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav } from "@/components/nav";
import { Providers } from "@/app/providers";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";

export default async function SavedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const saves = await prisma.swipe.findMany({
    where: { userId: session.user.id, direction: "save" },
    include: { event: true },
    orderBy: { event: { startAt: "asc" } },
  });

  return (
    <Providers>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Saved events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {saves.length === 0
              ? "Nothing saved yet — swipe right on the discover feed."
              : `${saves.length} event${saves.length === 1 ? "" : "s"} ready to RSVP.`}
          </p>
        </div>

        {saves.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-4">
              🤍
            </div>
            <Button asChild>
              <Link href="/discover">Start swiping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {saves.map((s) => (
              <EventCard
                key={s.id}
                showRsvpLink
                event={{
                  id: s.event.id,
                  title: s.event.title,
                  description: s.event.description,
                  startAt: s.event.startAt.toISOString(),
                  location: s.event.location,
                  hostName: s.event.hostName,
                  coverImageUrl: s.event.coverImageUrl,
                  externalUrl: s.event.externalUrl,
                  source: s.event.source,
                  priceLabel: s.event.priceLabel,
                  category: s.event.category,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </Providers>
  );
}
