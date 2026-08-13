import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GuestTable } from "@/components/guests/GuestTable";

export default async function GuestsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return <p className="text-ink-soft">No wedding found.</p>;

  const guests = await prisma.guest.findMany({ where: { weddingId: wedding.id }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Guests</h1>
      <GuestTable initialGuests={guests as any} />
    </div>
  );
}
