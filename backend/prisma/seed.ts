import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Clear existing data before seeding (optional but good for a clean state)
  await prisma.barang.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.lokasigudang.deleteMany();
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

    // Sesuai kondisi gudang asli: Ada 4 Rak, masing-masing 4 Baris
    // Setiap baris ada 1 keranjang, dan setiap keranjang menampung 4 barang
    // Total kapasitas gudang = 4 * 4 * 4 = 64 barang
    
    let lokasiId: number | null = null;
    
    if (successCount < 64) {
      const rakNum = Math.floor(successCount / 16) + 1; // 1 sampai 4
      const localI = successCount % 16; // 0 sampai 15
      
      const barisNum = Math.floor(localI / 4) + 1; // 1 sampai 4
      const keranjangNum = barisNum; // 1 keranjang per baris
      const barangIdx = (localI % 4) + 1; // 1 sampai 4
      
      const namaLokasi = `RK${rakNum}-${keranjangNum}.${barangIdx}`;
      const zonaName = `Rak ${rakNum}`; 
      
      // Upsert Lokasi
      const lokasi = await prisma.lokasigudang.upsert({
        where: { nama: namaLokasi },
        update: {
          rak: `Rak ${rakNum}`,
          baris: barisNum,
          keranjang: keranjangNum.toString(),
          zona: zonaName
        },
        create: { 
          nama: namaLokasi,
          rak: `Rak ${rakNum}`,
          baris: barisNum,
          keranjang: keranjangNum.toString(),
          zona: zonaName,
          kapasitas: 1
        },
      });
      lokasiId = lokasi.id;
    }

    try {
      // Upsert Category
      const kategori = await prisma.kategori.upsert({
        where: { nama: namaKategori },
        update: {},
        create: { nama: namaKategori },
      });

      // Upsert Barang
      await prisma.barang.upsert({
        where: { sku: sku },
        update: {
          nama,
          deskripsi,
          kategoriId: kategori.id,
          lokasiGudangId: lokasiId,
        },
        create: {
          sku,
          nama,
          deskripsi,
          kategoriId: kategori.id,
          lokasiGudangId: lokasiId,
          jumlah: 10, // Default stock
          updatedAt: new Date(),
        },
      });

      successCount++;
    } catch (error) {
      console.error(`Error importing SKU ${sku}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n Seeding finished!`);
  console.log(`✅ Successfully imported: ${successCount} items`);
  if (errorCount > 0) {
    console.log(`Failed to import: ${errorCount} items`);
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
