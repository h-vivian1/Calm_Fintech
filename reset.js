const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: { bankBalance: 0, savingsGoal: 0 },
    create: { id: 'default', bankBalance: 0, savingsGoal: 0 }
  });
  console.log('Reset complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
