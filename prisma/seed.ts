import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if already seeded
  const boardCount = await prisma.board.count();
  if (boardCount > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  // Create boards
  await prisma.board.createMany({
    data: [
      { name: "Feature Requests", slug: "feature-requests", icon: "💡", position: 0 },
      { name: "Bug Reports", slug: "bug-reports", icon: "🐛", position: 1 },
      { name: "Integrations", slug: "integrations", icon: "🔗", position: 2 },
    ],
  });

  // Create statuses
  await prisma.status.createMany({
    data: [
      { name: "In Review", color: "#71717a", type: "REVIEWING", position: 0 },
      { name: "Planned", color: "#3b82f6", type: "UNSTARTED", position: 1 },
      { name: "In Progress", color: "#f59e0b", type: "ACTIVE", position: 2 },
      { name: "Completed", color: "#22c55e", type: "COMPLETED", position: 3 },
      { name: "Canceled", color: "#ef4444", type: "CANCELED", position: 4 },
    ],
  });

  console.log("✅ Seeded boards and statuses.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
