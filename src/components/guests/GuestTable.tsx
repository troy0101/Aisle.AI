"use client";

import { useState } from "react";
import type { Guest } from "@/types";

const RSVP_STYLES: Record<string, string> = {
  yes: "text-sage",
  no: "text-rust",
  pending: "text-ink-soft"
};

export function GuestTable({ initialGuests }: { initialGuests: Guest[] }) {
  const [guests, setGuests] = useState(initialGuests);
  const [form, setForm] = useState({ name: "", group: "", email: "" });
  const [adding, setAdding] = useState(false);

  async function addGuest() {
    if (!form.name.trim()) return;
    setAdding(true);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setAdding(false);
    if (res.ok) {
      const guest = await res.json();
      setGuests((prev) => [...prev, guest]);
      setForm({ name: "", group: "", email: "" });
    }
  }

  async function updateRsvp(id: string, rsvpStatus: string) {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, rsvpStatus: rsvpStatus as Guest["rsvpStatus"] } : g)));
    await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpStatus })
    });
  }

  async function removeGuest(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
  }

  const confirmed = guests.filter((g) => g.rsvpStatus === "yes").length;

  return (
    <div>
      <p className="text-sm text-ink-soft mb-6">
        {confirmed} confirmed of {guests.length} on the list
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        <input className="input flex-1 min-w-[10rem]" placeholder="Name" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="input flex-1 min-w-[10rem]" placeholder="Group (e.g. bride's family)" value={form.group}
          onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))} />
        <input className="input flex-1 min-w-[10rem]" placeholder="Email" value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <button onClick={addGuest} disabled={adding} className="btn-primary shrink-0">Add guest</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Group</th>
              <th className="px-4 py-3 font-medium">RSVP</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{g.name}</td>
                <td className="px-4 py-3 text-ink-soft">{g.group ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    className={`bg-transparent text-sm ${RSVP_STYLES[g.rsvpStatus]}`}
                    value={g.rsvpStatus}
                    onChange={(e) => updateRsvp(g.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeGuest(g.id)} className="text-ink-soft hover:text-rust text-xs">Remove</button>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-soft">No guests added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
