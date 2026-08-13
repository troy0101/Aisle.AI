import { NextResponse } from "next/server";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { anthropic, buildPlannerSystemPrompt, PLANNING_MODEL } from "@/lib/anthropic";

const HISTORY_LIMIT = 20;

export async function GET() {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const messages = await prisma.chatMessage.findMany({
    where: { weddingId: ctx.wedding.id },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = await req.json();
  const userMessage: string = body.message;
  if (!userMessage?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const [history, moodBoardItems] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { weddingId: ctx.wedding.id },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT
    }),
    prisma.moodBoardItem.findMany({ where: { weddingId: ctx.wedding.id }, select: { tags: true } })
  ]);

  await prisma.chatMessage.create({
    data: { weddingId: ctx.wedding.id, role: "user", content: userMessage }
  });

  const systemPrompt = buildPlannerSystemPrompt({
    partnerNames: ctx.wedding.partnerNames,
    weddingDate: ctx.wedding.weddingDate?.toISOString() ?? null,
    venue: ctx.wedding.venue,
    guestCountEst: ctx.wedding.guestCountEst,
    budgetTotal: ctx.wedding.budgetTotal?.toString() ?? null,
    stylePrefs: ctx.wedding.stylePrefs,
    moodBoardTags: moodBoardItems.flatMap((m: { tags: string[] }) => m.tags)
  });

  const orderedHistory = history.reverse();

  const response = await anthropic.messages.create({
    model: PLANNING_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...orderedHistory.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
      { role: "user" as const, content: userMessage }
    ]
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const assistantText = textBlock && textBlock.type === "text" ? textBlock.text : "";

  await prisma.chatMessage.create({
    data: { weddingId: ctx.wedding.id, role: "assistant", content: assistantText }
  });

  return NextResponse.json({ role: "assistant", content: assistantText });
}
