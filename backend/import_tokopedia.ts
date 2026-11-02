import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const rootDir = path.join(__dirname, '..');
  
  // Find all JSON files in the root dir that start with tokopedia_lengkap
  const files = fs.readdirSync(rootDir).filter(file => file.startsWith('tokopedia_lengkap') && file.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('No tokopedia_lengkap json files found in root directory.');
    return;
  }

  let allProducts: any[] = [];
  const seenNames = new Set<string>();

  for (const file of files) {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const data = JSON.parse(content);
      for (const item of data) {
        if (!seenNames.has(item.nama)) {
          seenNames.add(item.nama);
          allProducts.push(item);
        }
      }
      console.log(`Read ${data.length} items from ${file}`);
    } catch (e) {
      console.error(`Error parsing JSON from ${file}:`, e);
    }
  }

  console.log(`Total unique products to process: ${allProducts.length}`);

  let updatedCount = 0;
  let createdCount = 0;

  // Find a default kategori for new products
  let defaultKategori = await prisma.kategori.findFirst({ where: { nama: 'Uncategorized' } });
  if (!defaultKategori) {
    defaultKategori = await prisma.kategori.create({ data: { nama: 'Uncategorized' } });
  }

  for (const product of allProducts) {
    let rawHarga = product.harga || '0';
    // Clean Rp and dots
    rawHarga = String(rawHarga).replace(/Rp/g, '').replace(/\./g, '').trim();
    const hargaInt = parseInt(rawHarga, 10) || 0;
    
    // Ignore short meaningless names
    if (product.nama.length < 5) continue;

    const existingBarang = await prisma.barang.findFirst({
      where: {
        nama: {
          equals: product.nama,
          mode: 'insensitive' // postgres specific
        }
      }
    });

    if (existingBarang) {
      // Update
      await prisma.barang.update({
        where: { id: existingBarang.id },
        data: {
          harga: hargaInt,
          urlGambar: product.gambar
        }
      });
      updatedCount++;
    } else {
      // Create new
      const sku = `TKPD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await prisma.barang.create({
        data: {
          sku: sku,
          nama: product.nama,
          harga: hargaInt,
          urlGambar: product.gambar,
          jumlah: 0,
          kategoriId: defaultKategori.id,
          // no lokasiGudangId initially
        }
      });
      createdCount++;
    }
  }

  console.log(`\nImport Summary:`);
  console.log(`Updated existing items: ${updatedCount}`);
  console.log(`Created new items: ${createdCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
