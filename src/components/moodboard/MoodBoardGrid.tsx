"use client";

import { useState } from "react";
import Image from "next/image";
import type { MoodBoardItem } from "@/types";

export function MoodBoardGrid({ initialItems }: { initialItems: MoodBoardItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function addLink() {
    if (!linkUrl.trim()) return;
    const res = await fetch("/api/moodboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkUrl.trim() })
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setLinkUrl("");
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/moodboard", { method: "POST", body: form });
    setUploading(false);
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          className="input"
          placeholder="Paste a Pinterest or Etsy link…"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLink()}
        />
        <button onClick={addLink} className="btn-secondary shrink-0">Add link</button>
        <label className="btn-secondary shrink-0 cursor-pointer text-center">
          {uploading ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Nothing here yet. Paste a link from Pinterest or Etsy, or upload a photo that captures the vibe.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="card block p-0 overflow-hidden group">
              {item.type === "image" ? (
                <div className="relative aspect-square">
                  <Image src={item.url} alt={item.title ?? "Mood board image"} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center p-4 text-center bg-cloud">
                  <p className="text-xs uppercase tracking-wide text-brass mb-2">{item.sourceSite ?? "Link"}</p>
                  <p className="text-sm text-ink-soft break-all line-clamp-4 group-hover:text-ink">{item.url}</p>
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
