import { NextResponse } from "next/server";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = await req.json();
  const guest = await prisma.guest.updateMany({
    where: { id: params.id, weddingId: ctx.wedding.id },
    data: body
  });
  if (guest.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  await prisma.guest.deleteMany({ where: { id: params.id, weddingId: ctx.wedding.id } });
  return NextResponse.json({ ok: true });
}
