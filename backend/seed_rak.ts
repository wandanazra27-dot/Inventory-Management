import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const data = {
  "RAK 1-1": [
    "Valve 16mm×12inch - flow control/stop kran selang 16mm",
    "Drip tape valve - male thread",
    "Check valve 1/2 inch drat (female/betina) ke selang PE 16 mm/13 mm",
    "mini valve 16mm stop kran ke selang PE 13mm/16mm (1/2\") check valve",
    "Check valve 11mm/mini valve selang ke selang 11 mm/stop kran 11mm",
    "Drip tape valve - male thread / konektor keran selang Drip tape",
    "Drip tape valve - male trip 3/4"
  ],
  "RAK 1-2": [
    "Drip tape connector - PE House 16mm",
    "Drip tape connector - PE House 16mm (seal tape)",
    "End plug Drip tape/tutup selang Drip tape",
    "Dripper Emiter 8L/H drip irigasi tetes",
    "Dripper Emiter 4L/H Drip irigasi tetes",
    "Drippee Emiter 2L/H Drip irigasi tetes",
    "universal tap adapter quick connector kran keran konektor selang air"
  ],
  "RAK 1-3": [
    "Quick connector male 2 ways valve to female thread 3/4\" & 1/2\"",
    "End plug Drip tape/tutup selang Drip tape",
    "Quick connector 7mm/quick disconnect/konektor kran/quick release",
    "konektor selang air cabang 2 ukuran 3/4\" untuk irigasi kebun/keran Y"
  ],
  "RAK 1-4": [
    "connector Tee male thread/konektor T drat 16 mm to 1/2\"",
    "barb connector 16 mm",
    "konektor pipa PVC 1/2\" selang 7mm male thread 7mm drat connector 4/7",
    "Connector Elbow selang PE 11mm/8mm"
  ]
};

async function main() {
  console.log('Menyiapkan Kategori...');
  let kat = await prisma.kategori.findFirst({ where: { nama: 'Peralatan Irigasi' } });
  if (!kat) {
    kat = await prisma.kategori.create({ data: { nama: 'Peralatan Irigasi' } });
  }

  for (const [rakName, items] of Object.entries(data)) {
    console.log(`\nMemproses lokasi: ${rakName}`);
    
    // Ensure location exists
    let loc = await prisma.lokasigudang.findUnique({ where: { nama: rakName } });
    if (!loc) {
      loc = await prisma.lokasigudang.create({
        data: {
          nama: rakName,
          zona: 'Gudang Utama',
          rak: '1',
          baris: parseInt(rakName.split('-')[1]) || 1
        }
      });
      console.log(`[+] Dibuat lokasi baru: ${rakName}`);
    }

    // Insert items
    for (let i = 0; i < items.length; i++) {
      const itemName = items[i];
      const sku = `IRG-${rakName.replace(' ', '')}-${i+1}-${Date.now().toString().slice(-4)}`;
      
      const existing = await prisma.barang.findFirst({ where: { nama: itemName } });
      if (!existing) {
        await prisma.barang.create({
          data: {
            nama: itemName,
            sku: sku,
            jumlah: 0,
            kategoriId: kat.id,
            lokasiGudangId: loc.id
          }
        });
        console.log(`  [v] Ditambahkan: ${itemName}`);
      } else {
        await prisma.barang.update({
          where: { id: existing.id },
          data: { lokasiGudangId: loc.id }
        });
        console.log(`  [-] Diperbarui lokasi: ${itemName}`);
      }
    }
  }
  
  console.log('\nSelesai!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
