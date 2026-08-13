import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const items = await prisma.moodBoardItem.findMany({
    where: { weddingId: ctx.wedding.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(items);
}

// Handles two intake paths in one route:
// 1. multipart/form-data with a "file" field -> uploaded image, stored in
//    Vercel Blob.
// 2. application/json with a "url" field -> a pasted Pinterest/Etsy/etc link,
//    saved as-is (no scraping in v1 — those sites block naive fetches and
//    have no public API, so pulling real preview images is a later pass,
//    likely via a headless-browser fetch or an unfurl service).
export async function POST(req: Request) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const blob = await put(`moodboard/${ctx.wedding.id}/${Date.now()}-${file.name}`, file, {
      access: "public"
    });

    const item = await prisma.moodBoardItem.create({
      data: {
        weddingId: ctx.wedding.id,
        type: "image",
        url: blob.url,
        sourceSite: "upload",
        tags: []
      }
    });
    return NextResponse.json(item, { status: 201 });
  }

  const body = await req.json();
  if (!body.url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const sourceSite = body.url.includes("pinterest")
    ? "pinterest"
    : body.url.includes("etsy")
    ? "etsy"
    : "other";

  const item = await prisma.moodBoardItem.create({
    data: {
      weddingId: ctx.wedding.id,
      type: "link",
      url: body.url,
      sourceSite,
      title: body.title,
      tags: body.tags ?? []
    }
  });
  return NextResponse.json(item, { status: 201 });
}
