import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Clear existing data before seeding (optional but good for a clean state)
  await prisma.barang.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.lokasiGudang.deleteMany();
  console.log('🧹 Cleared existing database records.');

  // 1. Read Excel file
  const excelFilePath = path.join(process.cwd(), 'data barang.xlsx');
  console.log(`Reading Excel file from: ${excelFilePath}`);
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Read all rows (header = 1 means array of arrays)
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  // Data starts at row index 5
  let dataRows = rows.slice(5);
  
  console.log(`Found ${dataRows.length} items to import.`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length === 0) continue;

    const sku = row[0]?.toString();
    const kategoriFull = row[2]?.toString() || 'Uncategorized';
    const nama = row[4]?.toString();
    let deskripsi = row[5]?.toString() || '';

    // If there is no SKU or Nama, skip
    if (!sku || !nama) {
      continue;
    }

    // Clean category name
    let namaKategori = kategoriFull;
    if (kategoriFull.includes('(')) {
      namaKategori = kategoriFull.split('(')[0].trim();
    }

    // Generate Lokasi name based on index
    // Example logic: 10 keranjang per rak, 10 barang per keranjang
    const rak = Math.floor(i / 100) + 1;
    const keranjang = Math.floor((i % 100) / 10) + 1;
    const barangIdx = (i % 10) + 1;
    const namaLokasi = `RK${rak}-${keranjang}.${barangIdx}`;

    // Determine Zone (e.g. Zone A for rak 1, Zone B for rak 2...)
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    const zona = zones[(rak - 1) % zones.length];
    const kapasitas = 100;

    try {
      // Upsert Category
      const kategori = await prisma.kategori.upsert({
        where: { nama: namaKategori },
        update: {},
        create: { nama: namaKategori },
      });

      // Upsert Lokasi
      const lokasi = await prisma.lokasiGudang.upsert({
        where: { nama: namaLokasi },
        update: {
          zona: zona,
          kapasitas: kapasitas,
        },
        create: { 
          nama: namaLokasi,
          zona: zona,
          kapasitas: kapasitas,
        },
      });

      // Upsert Barang
      await prisma.barang.upsert({
        where: { sku: sku },
        update: {
          nama,
          deskripsi,
          kategoriId: kategori.id,
          lokasiGudangId: lokasi.id,
        },
        create: {
          sku,
          nama,
          deskripsi,
          kategoriId: kategori.id,
          lokasiGudangId: lokasi.id,
          jumlah: 0, // Initial stock is 0
        },
      });

      successCount++;
    } catch (error) {
      console.error(`❌ Error importing SKU ${sku}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n🎉 Seeding finished!`);
  console.log(`✅ Successfully imported: ${successCount} items`);
  if (errorCount > 0) {
    console.log(`❌ Failed to import: ${errorCount} items`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
