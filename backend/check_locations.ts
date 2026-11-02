import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const locs = await prisma.lokasigudang.findMany();
  console.log('Existing locations:', locs.map(l => l.nama));
}

main().catch(console.error).finally(() => prisma.$disconnect());
