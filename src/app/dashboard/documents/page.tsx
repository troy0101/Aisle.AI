import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentGenerator } from "@/components/documents/DocumentGenerator";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const wedding = await prisma.wedding.findFirst({ where: { userId } });
  if (!wedding) return <p className="text-ink-soft">No wedding found.</p>;

  const documents = await prisma.document.findMany({ where: { weddingId: wedding.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Documents</h1>
      <DocumentGenerator
        initialDocuments={documents.map((d: (typeof documents)[number]) => ({
          ...d,
          createdAt: d.createdAt.toISOString()
        })) as any}
      />
    </div>
  );
}
