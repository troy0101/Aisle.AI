import { NextResponse } from "next/server";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const vendors = await prisma.vendor.findMany({
    where: { weddingId: ctx.wedding.id },
    orderBy: { category: "asc" }
  });
  return NextResponse.json(vendors);
}

export async function POST(req: Request) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = await req.json();
  if (!body.name || !body.category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  const vendor = await prisma.vendor.create({
    data: {
      weddingId: ctx.wedding.id,
      category: body.category,
      name: body.name,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      status: body.status ?? "researching",
      cost: body.cost,
      contractUrl: body.contractUrl,
      notes: body.notes
    }
  });
  return NextResponse.json(vendor, { status: 201 });
}
