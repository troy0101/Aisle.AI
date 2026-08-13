import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return <p className="text-ink-soft">No wedding found.</p>;

  const messages = await prisma.chatMessage.findMany({
    where: { weddingId: wedding.id },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Planning chat</h1>
      <ChatInterface
        initialMessages={messages.map((m: (typeof messages)[number]) => ({
          ...m,
          createdAt: m.createdAt.toISOString()
        })) as any}
      />
    </div>
  );
}
