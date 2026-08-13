"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ partnerNames: "", email: "", password: "", weddingDate: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Couldn't create your account — check the fields above.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Account created — log in to continue.");
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg">Aisle</Link>
        <h1 className="font-display text-2xl mt-6 mb-6">Start planning</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="partnerNames">Your names</label>
            <input id="partnerNames" required placeholder="Amanda & Troy" className="input"
              value={form.partnerNames} onChange={(e) => update("partnerNames", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="weddingDate">Wedding date (if set)</label>
            <input id="weddingDate" type="date" className="input"
              value={form.weddingDate} onChange={(e) => update("weddingDate", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input"
              value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} className="input"
              value={form.password} onChange={(e) => update("password", e.target.value)} />
          </div>
          {error && <p className="text-sm text-rust">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink-soft mt-6">
          Already planning with us? <Link href="/login" className="text-brass">Log in</Link>
        </p>
      </div>
    </main>
  );
}
