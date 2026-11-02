import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const badLocationNames = ['RAK 1-1', 'RAK 1-2', 'RAK 1-3', 'RAK 1-4'];
  
  for (const name of badLocationNames) {
    const loc = await prisma.lokasigudang.findUnique({ where: { nama: name } });
    if (loc) {
      // Unlink items
      await prisma.barang.updateMany({
        where: { lokasiGudangId: loc.id },
        data: { lokasiGudangId: null }
      });
      // Delete location
      await prisma.lokasigudang.delete({ where: { id: loc.id } });
      console.log(`Deleted location: ${name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
