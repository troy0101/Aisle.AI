"use client";

import { useState } from "react";
import type { WeddingDocument } from "@/types";
import { formatDate } from "@/lib/utils";

const DOC_TYPES = [
  { value: "timeline", label: "Day-of timeline" },
  { value: "checklist", label: "Planning checklist" },
  { value: "vendor_contract", label: "Vendor booking brief" },
  { value: "seating", label: "Seating chart worksheet" }
];

export function DocumentGenerator({ initialDocuments }: { initialDocuments: WeddingDocument[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [type, setType] = useState(DOC_TYPES[0].value);
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const res = await fetch("/api/documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type })
    });
    setGenerating(false);
    if (res.ok) {
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
    }
  }

  return (
    <div>
      <div className="card mb-8">
        <h2 className="font-display text-lg mb-4">Draft a new document</h2>
        <div className="flex flex-wrap gap-3">
          <select className="input flex-1 min-w-[10rem]" value={type} onChange={(e) => setType(e.target.value)}>
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button onClick={generate} disabled={generating} className="btn-primary shrink-0">
            {generating ? "Drafting…" : "Generate PDF"}
          </button>
        </div>
        <p className="text-xs text-ink-soft mt-3">
          Pulls from your wedding date, venue, and planning chat context to draft the first version — review before sending.
        </p>
      </div>

      <div className="space-y-2">
        {documents.map((d) => (
          <a
            key={d.id}
            href={d.fileUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="card flex items-center justify-between hover:border-brass transition-colors"
          >
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-ink-soft">{formatDate(d.createdAt)}</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-brass">View PDF</span>
          </a>
        ))}
        {documents.length === 0 && <p className="text-sm text-ink-soft">No documents drafted yet.</p>}
      </div>
    </div>
  );
}
