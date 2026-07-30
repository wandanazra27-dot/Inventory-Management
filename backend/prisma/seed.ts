import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');
  const katElektronik = await prisma.kategori.upsert({
    where: { nama: 'Elektronik' },
    update: {},
    create: { nama: 'Elektronik' },
  });
  const katFurniture = await prisma.kategori.upsert({
    where: { nama: 'Furniture' },
    update: {},
    create: { nama: 'Furniture' },
  });
  const lokasiA = await prisma.lokasiGudang.upsert({
    where: { nama: 'Gudang A' },
    update: {},
    create: { nama: 'Gudang A' },
  });
  const lokasiB = await prisma.lokasiGudang.upsert({
    where: { nama: 'Gudang B' },
    update: {},
    create: { nama: 'Gudang B' },
  });
  const barangLaptop = await prisma.barang.upsert({
    where: { sku: 'ELEC-001' },
    update: {},
    create: {
      sku: 'ELEC-001',
      nama: 'Laptop Dell XPS 15',
      deskripsi: 'High performance laptop',
      jumlah: 15,
      kategoriId: katElektronik.id,
      lokasiGudangId: lokasiA.id,
    },
  });
  const barangChair = await prisma.barang.upsert({
    where: { sku: 'FURN-001' },
    update: {},
    create: {
      sku: 'FURN-001',
      nama: 'Ergonomic Office Chair',
      deskripsi: 'Comfortable chair for long hours',
      jumlah: 50,
      kategoriId: katFurniture.id,
      lokasiGudangId: lokasiB.id,
    },
  });
  await prisma.riwayatScan.create({
    data: {
      barangId: barangLaptop.id,
      lokasiGudangId: lokasiA.id,
      jenis: 'IN',
      jumlah: 15,
      catatan: 'Initial stock entry',
    },
  });
  await prisma.riwayatScan.create({
    data: {
      barangId: barangChair.id,
      lokasiGudangId: lokasiB.id,
      jenis: 'IN',
      jumlah: 50,
      catatan: 'Initial stock entry',
    },
  });
  await prisma.riwayatPencarian.create({
    data: {
      kataKunci: 'Laptop',
    },
  });
  await prisma.riwayatPencarian.create({
    data: {
      kataKunci: 'Kursi kantor',
    },
  });
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
