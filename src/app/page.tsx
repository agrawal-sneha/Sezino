import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/discover");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Sezino
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/signin">Sign in</Link>
        </Button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto -mt-10">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted border border-border text-muted-foreground mb-6">
          Luma · Eventbrite · Meetup — one feed
        </span>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-5">
          Swipe.{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RSVP.
          </span>{" "}
          Show up.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-9 max-w-xl">
          Sezino pulls every event from the platforms you already use into a
          single Tinder-style feed. Save what you like, skip what you don't.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button size="lg" asChild>
            <Link href="/auth/signin">Get started — it's free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/discover">Try the demo</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          {[
            {
              title: "One feed",
              body: "No more checking three apps. Every event from Luma, Eventbrite, and Meetup in one stack.",
            },
            {
              title: "Swipe to save",
              body: "Right to save, left to skip. Your taste model gets smarter with every swipe.",
            },
            {
              title: "One-tap RSVP",
              body: "Click through to the source platform with a single tap. We handle the discovery; you handle the showing up.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl bg-card border border-border text-left"
            >
              <h3 className="font-bold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-snug">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        Built with Next.js, Prisma, and a lot of late nights.
      </footer>
    </main>
  );
}
