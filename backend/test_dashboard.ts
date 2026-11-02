import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log("Connecting using DIRECT_URL...");
  const res = await prisma.barang.count();
  console.log('Total barang:', res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
