import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({
    where: { userId },
    include: {
      _count: { select: { guests: true, vendors: true, moodBoardItems: true, documents: true } },
      budgetItems: true
    }
  });

  if (!wedding) {
    return <p className="text-ink-soft">No wedding found on this account yet.</p>;
  }

  const days = daysUntil(wedding.weddingDate);
  const spentSoFar = wedding.budgetItems.reduce(
    (sum: number, item: (typeof wedding.budgetItems)[number]) => sum + Number(item.actualCost ?? 0),
    0
  );
  const estimatedTotal = wedding.budgetItems.reduce(
    (sum: number, item: (typeof wedding.budgetItems)[number]) => sum + Number(item.estimatedCost),
    0
  );

  const stats = [
    { label: "Guests", value: wedding._count.guests, href: "/dashboard/guests" },
    { label: "Vendors", value: wedding._count.vendors, href: "/dashboard/vendors" },
    { label: "Mood board items", value: wedding._count.moodBoardItems, href: "/dashboard/moodboard" },
    { label: "Documents drafted", value: wedding._count.documents, href: "/dashboard/documents" }
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-brass mb-2">
        {days !== null && days >= 0 ? `${days} days to go` : "Date not set yet"}
      </p>
      <h1 className="font-display text-3xl mb-1">{wedding.partnerNames}</h1>
      <p className="text-ink-soft mb-8">
        {wedding.venue ?? "Venue not set"} · {formatDate(wedding.weddingDate)}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-brass transition-colors">
            <p className="font-display text-3xl">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-ink-soft mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="card mb-10">
        <h2 className="font-display text-xl mb-4">Budget</h2>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-ink-soft">Spent so far</span>
          <span className="font-mono text-lg">{formatCurrency(spentSoFar)}</span>
        </div>
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-ink-soft">Estimated total</span>
          <span className="font-mono text-lg">{formatCurrency(estimatedTotal || Number(wedding.budgetTotal ?? 0))}</span>
        </div>
        <div className="h-2 bg-line rounded overflow-hidden">
          <div
            className="h-full bg-brass"
            style={{ width: `${estimatedTotal ? Math.min(100, (spentSoFar / estimatedTotal) * 100) : 0}%` }}
          />
        </div>
        <Link href="/dashboard/budget" className="text-sm text-brass mt-4 inline-block">View full budget →</Link>
      </div>

      <div className="card">
        <h2 className="font-display text-xl mb-2">Keep planning</h2>
        <p className="text-sm text-ink-soft mb-4">
          Pick up the conversation with your planning assistant — it already knows your date, venue, and style.
        </p>
        <Link href="/dashboard/chat" className="btn-primary inline-block">Open planning chat</Link>
      </div>
    </div>
  );
}
