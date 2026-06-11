"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { Heart, X, RefreshCw } from "lucide-react";
import { EventCard, type EventCardData } from "@/components/event-card";
import { Button } from "@/components/ui/button";

const SWIPE_THRESHOLD = 120;

export function SwipeDeck({ initialEvents }: { initialEvents: EventCardData[] }) {
  const [events] = useState(initialEvents);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<"save" | "skip" | null>(null);

  const current = events[index];
  const next = events[index + 1];
  const after = events[index + 2];

  async function handleSwipe(direction: "save" | "skip", eventId: string) {
    setLastAction(direction);
    setIndex((i) => i + 1);
    // Fire and forget — UI advances optimistically
    try {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, direction }),
      });
    } catch (err) {
      console.error("swipe save failed", err);
    }
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-5 py-20">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl">
          🎉
        </div>
        <div>
          <h2 className="text-2xl font-bold">You're all caught up</h2>
          <p className="text-muted-foreground mt-1.5">
            Check back soon — new events drop daily.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="primary">
            <a href="/saved">View saved</a>
          </Button>
          <Button variant="outline" onClick={() => setIndex(0)}>
            <RefreshCw className="w-4 h-4" />
            Restart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-sm aspect-[4/5]">
        {/* Background card 2 */}
        {after && (
          <div
            className="absolute inset-0 scale-[0.9] -translate-y-2 opacity-40"
            aria-hidden
          >
            <EventCard event={after} />
          </div>
        )}
        {/* Background card 1 */}
        {next && (
          <div
            className="absolute inset-0 scale-95 -translate-y-1 opacity-70"
            aria-hidden
          >
            <EventCard event={next} />
          </div>
        )}
        {/* Top card — interactive */}
        <AnimatePresence>
          <DraggableCard
            key={current.id}
            event={current}
            onSwipe={(dir) => handleSwipe(dir, current.id)}
          />
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Skip"
          onClick={() => handleSwipe("skip", current.id)}
          className="w-14 h-14 rounded-full border-2 border-danger/40 text-danger hover:bg-danger/10"
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Save"
          onClick={() => handleSwipe("save", current.id)}
          className="w-14 h-14 rounded-full border-2 border-success/40 text-success hover:bg-success/10"
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {lastAction === "save" && "✓ Saved"}
        {lastAction === "skip" && "Skipped"}
        {!lastAction && "Drag the card or tap a button"}
      </p>
    </div>
  );
}

function DraggableCard({
  event,
  onSwipe,
}: {
  event: EventCardData;
  onSwipe: (direction: "save" | "skip") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);
  const saveOpacity = useTransform(x, [0, 80, 160], [0, 0.6, 1]);
  const skipOpacity = useTransform(x, [-160, -80, 0], [1, 0.6, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe("save");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe("skip");
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 600 : -600, opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      whileTap={{ cursor: "grabbing" }}
    >
      <EventCard event={event} />
      <motion.div
        className="absolute top-10 left-6 -rotate-12 px-4 py-1.5 border-4 border-success rounded-lg text-success font-black text-2xl tracking-wider pointer-events-none"
        style={{ opacity: saveOpacity }}
      >
        SAVE
      </motion.div>
      <motion.div
        className="absolute top-10 right-6 rotate-12 px-4 py-1.5 border-4 border-danger rounded-lg text-danger font-black text-2xl tracking-wider pointer-events-none"
        style={{ opacity: skipOpacity }}
      >
        SKIP
      </motion.div>
    </motion.div>
  );
}
