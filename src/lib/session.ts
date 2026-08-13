import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Every data route (guests, vendors, budget, chat, mood board) scopes to
// "the current user's wedding" — this is the one place that lookup happens
// so access control can't be forgotten in an individual route.
export async function requireOwnedWedding() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }
  const userId = (session.user as { id: string }).id;
  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) {
    return { error: "No wedding found" as const, status: 404 as const };
  }
  return { wedding, userId };
}
