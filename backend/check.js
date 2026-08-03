const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const countBarang = await prisma.barang.count();
  const countLokasi = await prisma.lokasiGudang.count();
  const lokasi = await prisma.lokasiGudang.findMany({take: 12});
  
  console.log(`✅ Update Selesai!`);
  console.log(`Total Barang saat ini: ${countBarang}`);
  console.log(`Total Lokasi saat ini: ${countLokasi}`);
  console.log('Contoh Lokasi: ', lokasi.map(l => l.nama));
  await prisma.$disconnect();
}
check();
