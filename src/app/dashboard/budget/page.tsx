import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BudgetTable } from "@/components/budget/BudgetTable";

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return <p className="text-ink-soft">No wedding found.</p>;

  const items = await prisma.budgetItem.findMany({ where: { weddingId: wedding.id }, orderBy: { category: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Budget</h1>
      <BudgetTable initialItems={items as any} />
    </div>
  );
}
