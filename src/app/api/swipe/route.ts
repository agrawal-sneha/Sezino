import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const SwipeBody = z.object({
  eventId: z.string().min(1),
  direction: z.enum(["save", "skip"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = SwipeBody.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { eventId, direction } = parsed.data;
  await prisma.swipe.upsert({
    where: { userId_eventId: { userId: session.user.id, eventId } },
    create: { userId: session.user.id, eventId, direction },
    update: { direction },
  });

  return NextResponse.json({ ok: true });
}
