import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.expense.deleteMany();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const samples = [
    { amount: 84.5, description: "Groceries", category: "FOOD", day: 2 },
    { amount: 32, description: "Coffee", category: "FOOD", day: 4 },
    { amount: 120, description: "Fuel", category: "TRANSPORT", day: 5 },
    { amount: 45.99, description: "Streaming", category: "ENTERTAINMENT", day: 7 },
    { amount: 210, description: "Electric bill", category: "UTILITIES", day: 8 },
    { amount: 68, description: "Pharmacy", category: "HEALTH", day: 11 },
    { amount: 159, description: "Clothing", category: "SHOPPING", day: 14 },
    { amount: 24, description: "Parking", category: "TRANSPORT", day: 16 },
    { amount: 55.2, description: "Restaurant", category: "FOOD", day: 18 },
    { amount: 18, description: "Misc supplies", category: "OTHER", day: 20 },
  ];

  for (const row of samples) {
    await prisma.expense.create({
      data: {
        amount: row.amount,
        description: row.description,
        category: row.category,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), row.day),
      },
    });
  }

  const prev = new Date(monthStart);
  prev.setMonth(prev.getMonth() - 1);
  await prisma.expense.create({
    data: {
      amount: 980,
      description: "Previous month total sample",
      category: "OTHER",
      date: new Date(prev.getFullYear(), prev.getMonth(), 15),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
