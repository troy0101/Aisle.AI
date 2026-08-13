import Link from "next/link";

// Signature element: a stitched "thread" rule — wedding planning is
// fundamentally a countdown strung between fixed dates and decisions.
// Used once, deliberately, instead of a generic hero graphic.
function ThreadRule() {
  return (
    <svg viewBox="0 0 600 12" className="w-full h-3" preserveAspectRatio="none">
      <line x1="0" y1="6" x2="600" y2="6" stroke="#A6793F" strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" />
    </svg>
  );
}

const capabilities = [
  {
    title: "Planning chat",
    body: "A planner that remembers your date, budget, and taste — and asks the next right question instead of a 40-field intake form."
  },
  {
    title: "Mood board",
    body: "Drop in images or paste links from Pinterest and Etsy. Tag the ones that matter and the planner references them when it drafts anything."
  },
  {
    title: "Vendor & guest tracking",
    body: "One place for who you've booked, who owes a deposit, and who still hasn't RSVP'd — no spreadsheet forked six ways."
  },
  {
    title: "Document drafting",
    body: "Ask for a day-of timeline, a planning checklist, or a vendor brief, and get a formatted PDF back in seconds."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="max-w-5xl mx-auto px-6 pt-10 pb-4 flex items-center justify-between">
        <span className="font-display text-lg tracking-tight">Aisle</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-ink-soft hover:text-ink">Log in</Link>
          <Link href="/signup" className="btn-primary">Start planning</Link>
        </nav>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-brass mb-4">A wedding planner, not a wedding blog</p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] max-w-3xl">
          Everything the coordinator would ask you, in one running conversation.
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-xl">
          Aisle keeps your vision, your vendors, your guest list, and your budget in one place —
          and does the drafting for you when you're ready to move.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link href="/signup" className="btn-primary">Start planning</Link>
          <Link href="/login" className="btn-secondary">I already have an account</Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <ThreadRule />
      </div>

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        {capabilities.map((c) => (
          <div key={c.title} className="card">
            <h3 className="font-display text-xl mb-2">{c.title}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-10 text-xs text-ink-soft border-t border-line">
        Aisle — built for couples who'd rather plan once than plan everywhere.
      </footer>
    </main>
  );
}
