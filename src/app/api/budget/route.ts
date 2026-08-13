import { NextResponse } from "next/server";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const items = await prisma.budgetItem.findMany({
    where: { weddingId: ctx.wedding.id },
    include: { vendor: { select: { name: true } } },
    orderBy: { category: "asc" }
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = await req.json();
  if (!body.category || body.estimatedCost === undefined) {
    return NextResponse.json({ error: "Category and estimated cost are required" }, { status: 400 });
  }

  const item = await prisma.budgetItem.create({
    data: {
      weddingId: ctx.wedding.id,
      vendorId: body.vendorId || undefined,
      category: body.category,
      description: body.description,
      estimatedCost: body.estimatedCost,
      actualCost: body.actualCost,
      paid: body.paid ?? false,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    }
  });
  return NextResponse.json(item, { status: 201 });
}
