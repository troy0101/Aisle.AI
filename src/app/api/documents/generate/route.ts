import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireOwnedWedding } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { anthropic, PLANNING_MODEL } from "@/lib/anthropic";
import { renderDocumentPDF } from "@/lib/pdf";

const DOC_PROMPTS: Record<string, (ctx: { partnerNames: string; weddingDate?: string | null; venue?: string | null }) => string> = {
  timeline: (ctx) =>
    `Draft a wedding day timeline for ${ctx.partnerNames}, wedding date ${ctx.weddingDate ?? "TBD"}, venue ${ctx.venue ?? "TBD"}.
Cover getting-ready through send-off in clear time blocks. Plain text, section headings in caps, one line per event.`,
  checklist: (ctx) =>
    `Draft a wedding planning checklist for ${ctx.partnerNames}, wedding date ${ctx.weddingDate ?? "TBD"}.
Group tasks under headings by how far out they typically need to happen (12+ months, 6 months, 1 month, week-of).
Plain text, section headings in caps, one task per line.`,
  vendor_contract: (ctx) =>
    `Draft a vendor booking brief for ${ctx.partnerNames} to send to a prospective vendor for their wedding at ${ctx.venue ?? "TBD"}
on ${ctx.weddingDate ?? "TBD"}. Include event details, what's being requested, and open questions to confirm before booking.
Plain text, section headings in caps.`,
  seating: (ctx) =>
    `Draft a seating chart planning worksheet for ${ctx.partnerNames}. Include a section for table groupings guidance and a
blank template structure they can fill in per table. Plain text, section headings in caps.`
};

export async function GET() {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const docs = await prisma.document.findMany({
    where: { weddingId: ctx.wedding.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(docs);
}

// Generates document *content* with Claude, renders it to a PDF, uploads the
// PDF to Blob storage, and saves a Document row pointing at it. Synchronous
// for v1 — move to a background job once documents get long enough that this
// risks the serverless function timeout.
export async function POST(req: Request) {
  const ctx = await requireOwnedWedding();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = await req.json();
  const type: string = body.type;
  const promptBuilder = DOC_PROMPTS[type];
  if (!promptBuilder) {
    return NextResponse.json({ error: `Unknown document type: ${type}` }, { status: 400 });
  }

  const prompt = promptBuilder({
    partnerNames: ctx.wedding.partnerNames,
    weddingDate: ctx.wedding.weddingDate?.toISOString() ?? null,
    venue: ctx.wedding.venue
  });

  const response = await anthropic.messages.create({
    model: PLANNING_MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: body.extraInstructions ? `${prompt}\n\nAlso factor in: ${body.extraInstructions}` : prompt }]
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const content = textBlock && textBlock.type === "text" ? textBlock.text : "";

  const title = body.title ?? type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const pdfBuffer = await renderDocumentPDF(title, content);

  const blob = await put(`documents/${ctx.wedding.id}/${Date.now()}-${type}.pdf`, pdfBuffer, {
    access: "public",
    contentType: "application/pdf"
  });

  const document = await prisma.document.create({
    data: {
      weddingId: ctx.wedding.id,
      type,
      title,
      format: "pdf",
      fileUrl: blob.url,
      content
    }
  });

  return NextResponse.json(document, { status: 201 });
}
