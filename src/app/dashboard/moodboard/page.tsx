import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MoodBoardGrid } from "@/components/moodboard/MoodBoardGrid";

export default async function MoodBoardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return <p className="text-ink-soft">No wedding found.</p>;

  const items = await prisma.moodBoardItem.findMany({
    where: { weddingId: wedding.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Mood board</h1>
      <MoodBoardGrid initialItems={items as any} />
    </div>
  );
}
