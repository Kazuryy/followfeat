import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cats = [
    { value: "NEW",      label: "New",      color: "#22c55e", position: 0 },
    { value: "IMPROVED", label: "Improved", color: "#8b5cf6", position: 1 },
    { value: "FIXED",    label: "Fixed",    color: "#3b82f6", position: 2 },
    { value: "BETA",     label: "Beta",     color: "#f97316", position: 3 },
  ];
  for (const cat of cats) {
    await prisma.changelogCategory.upsert({
      where: { value: cat.value },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Seeded changelog categories.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
