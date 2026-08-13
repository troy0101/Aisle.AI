import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// v1 assumption: one wedding per account. Returns the couple's wedding plus
// enough related data for the dashboard overview page in a single call.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wedding = await prisma.wedding.findFirst({
    where: { userId: (session.user as { id: string }).id },
    include: {
      _count: { select: { guests: true, vendors: true, moodBoardItems: true, documents: true } }
    }
  });

  if (!wedding) return NextResponse.json({ error: "No wedding found" }, { status: 404 });
  return NextResponse.json(wedding);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return NextResponse.json({ error: "No wedding found" }, { status: 404 });

  const updated = await prisma.wedding.update({
    where: { id: wedding.id },
    data: {
      partnerNames: body.partnerNames ?? undefined,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
      venue: body.venue ?? undefined,
      guestCountEst: body.guestCountEst ?? undefined,
      budgetTotal: body.budgetTotal ?? undefined,
      stylePrefs: body.stylePrefs ?? undefined
    }
  });

  return NextResponse.json(updated);
}
