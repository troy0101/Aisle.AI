"use client";

import { useState } from "react";
import type { BudgetItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function BudgetTable({ initialItems }: { initialItems: BudgetItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ category: "", estimatedCost: "" });
  const [adding, setAdding] = useState(false);

  async function addItem() {
    if (!form.category.trim() || !form.estimatedCost) return;
    setAdding(true);
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: form.category, estimatedCost: Number(form.estimatedCost) })
    });
    setAdding(false);
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setForm({ category: "", estimatedCost: "" });
    }
  }

  async function togglePaid(id: string, paid: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, paid } : i)));
    await fetch(`/api/budget/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid })
    });
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
  }

  const totalEstimated = items.reduce((sum, i) => sum + Number(i.estimatedCost), 0);
  const totalActual = items.reduce((sum, i) => sum + Number(i.actualCost ?? 0), 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Estimated total</p>
          <p className="font-display text-2xl">{formatCurrency(totalEstimated)}</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Actual so far</p>
          <p className="font-display text-2xl">{formatCurrency(totalActual)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <input className="input flex-1 min-w-[10rem]" placeholder="Category (venue, catering…)" value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        <input className="input w-32" placeholder="Estimated $" value={form.estimatedCost}
          onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))} />
        <button onClick={addItem} disabled={adding} className="btn-primary shrink-0">Add line item</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Estimated</th>
              <th className="px-4 py-3 font-medium">Actual</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{i.category}</td>
                <td className="px-4 py-3 font-mono">{formatCurrency(i.estimatedCost)}</td>
                <td className="px-4 py-3 font-mono">{formatCurrency(i.actualCost)}</td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={i.paid} onChange={(e) => togglePaid(i.id, e.target.checked)} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeItem(i.id)} className="text-ink-soft hover:text-rust text-xs">Remove</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">No budget line items yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
