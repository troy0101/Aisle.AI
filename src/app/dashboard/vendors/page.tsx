import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VendorTable } from "@/components/vendors/VendorTable";

export default async function VendorsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return <p className="text-ink-soft">No wedding found.</p>;

  const vendors = await prisma.vendor.findMany({ where: { weddingId: wedding.id }, orderBy: { category: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Vendors</h1>
      <VendorTable initialVendors={vendors as any} />
    </div>
  );
}
