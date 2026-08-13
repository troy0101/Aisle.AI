import { NextResponse } from "next/server";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const guests = await prisma.guest.findMany({
    where: { weddingId: ctx.wedding.id },
    orderBy: { name: "asc" }
  });
  return NextResponse.json(guests);
}

export async function POST(req: Request) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const guest = await prisma.guest.create({
    data: {
      weddingId: ctx.wedding.id,
      name: body.name,
      email: body.email,
      address: body.address,
      group: body.group,
      plusOne: body.plusOne ?? false,
      rsvpStatus: body.rsvpStatus ?? "pending",
      mealChoice: body.mealChoice,
      notes: body.notes
    }
  });
  return NextResponse.json(guest, { status: 201 });
}
