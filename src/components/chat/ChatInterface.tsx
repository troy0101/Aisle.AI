"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types";

export function ChatInterface({ initialMessages }: { initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() }
    ]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    setSending(false);

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong reaching the planning assistant. Try again in a moment.",
          createdAt: new Date().toISOString()
        }
      ]);
      return;
    }

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { id: `assistant-${Date.now()}`, role: "assistant", content: data.content, createdAt: new Date().toISOString() }
    ]);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <p className="text-sm text-ink-soft">
            Tell your planner what you&apos;re picturing — a vibe, a must-have, a budget worry. It&apos;ll take it from there.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
            <div
              className={`rounded px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user" ? "bg-ink text-paper" : "bg-cloud border border-line"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-ink-soft">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-4 border-t border-line mt-4">
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Message your planner…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send} disabled={sending} className="btn-primary shrink-0">Send</button>
      </div>
    </div>
  );
}
