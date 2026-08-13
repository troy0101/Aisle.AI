import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@aisle.app" },
    update: {},
    create: {
      email: "demo@aisle.app",
      passwordHash,
      name: "Demo Couple",
      weddings: {
        create: {
          partnerNames: "Amanda & Troy",
          weddingDate: new Date("2026-10-17"),
          venue: "Hotel Viking, Newport RI",
          guestCountEst: 190,
          budgetTotal: 85000,
          stylePrefs: { palette: ["ivory", "brass", "sage"], vibe: "editorial, coastal, understated" }
        }
      }
    }
  });

  console.log(`Seeded demo account: demo@aisle.app / password123 (user id ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
