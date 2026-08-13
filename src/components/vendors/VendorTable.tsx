"use client";

import { useState } from "react";
import type { Vendor } from "@/types";
import { formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  researching: "text-ink-soft",
  contacted: "text-brass",
  booked: "text-sage",
  paid: "text-sage"
};

export function VendorTable({ initialVendors }: { initialVendors: Vendor[] }) {
  const [vendors, setVendors] = useState(initialVendors);
  const [form, setForm] = useState({ name: "", category: "", cost: "" });
  const [adding, setAdding] = useState(false);

  async function addVendor() {
    if (!form.name.trim() || !form.category.trim()) return;
    setAdding(true);
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cost: form.cost ? Number(form.cost) : undefined })
    });
    setAdding(false);
    if (res.ok) {
      const vendor = await res.json();
      setVendors((prev) => [...prev, vendor]);
      setForm({ name: "", category: "", cost: "" });
    }
  }

  async function updateStatus(id: string, status: string) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: status as Vendor["status"] } : v)));
    await fetch(`/api/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  }

  async function removeVendor(id: string) {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        <input className="input flex-1 min-w-[10rem]" placeholder="Vendor name" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="input flex-1 min-w-[10rem]" placeholder="Category (florist, caterer…)" value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        <input className="input w-32" placeholder="Cost" value={form.cost}
          onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
        <button onClick={addVendor} disabled={adding} className="btn-primary shrink-0">Add vendor</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{v.name}</td>
                <td className="px-4 py-3 text-ink-soft">{v.category}</td>
                <td className="px-4 py-3 font-mono">{formatCurrency(v.cost)}</td>
                <td className="px-4 py-3">
                  <select
                    className={`bg-transparent text-sm ${STATUS_STYLES[v.status]}`}
                    value={v.status}
                    onChange={(e) => updateStatus(v.id, e.target.value)}
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="booked">Booked</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeVendor(v.id)} className="text-ink-soft hover:text-rust text-xs">Remove</button>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-soft">No vendors added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
