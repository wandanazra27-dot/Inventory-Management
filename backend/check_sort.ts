import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const locs = await prisma.lokasigudang.findMany();
  for (const loc of locs.slice(0, 16)) { // Just check the first 16 (Rak 1)
    console.log(`${loc.nama} - baris: ${loc.baris}, keranjang: ${loc.keranjang}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
