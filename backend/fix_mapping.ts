import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const dataMap = {
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
    "End plug Drip tape/tutup selang Drip tape - (Variant 2)", // Renamed to avoid DB collision if uniqueness is an issue. Actually nama is not unique in DB? Let's assume it isn't.
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
  console.log('Memulai sinkronisasi data Rak & Barang...');
  let kat = await prisma.kategori.findFirst({ where: { nama: 'Peralatan Irigasi' } });
  
  // Reset all current allocations for these items to avoid lingering data
  const allItemNames = Object.values(dataMap).flat().map(n => n.replace(' - (Variant 2)', ''));
  await prisma.barang.updateMany({
    where: { 
      nama: { in: allItemNames },
      kategoriId: kat?.id
    },
    data: { lokasiGudangId: null }
  });

  for (const [rakKey, items] of Object.entries(dataMap)) {
    // rakKey is e.g. "RAK 1-1", so baris is 1.
    const barisStr = rakKey.split('-')[1];
    const baris = parseInt(barisStr);

    for (let i = 0; i < items.length; i++) {
      const keranjang = i + 1;
      const locName = `RK1-${baris}.${keranjang}`; // e.g., RK1-1.5
      let itemName = items[i];

      // Ensure the exact slot locName exists
      let loc = await prisma.lokasigudang.findUnique({ where: { nama: locName } });
      if (!loc) {
        loc = await prisma.lokasigudang.create({
          data: {
            nama: locName,
            zona: 'Rak 1',
            rak: 'Rak 1',
            baris: baris,
            keranjang: keranjang.toString(),
            kapasitas: 100
          }
        });
        console.log(`[+] Dibuat lokasi slot baru: ${locName}`);
      }

      // We had an issue with duplicate name "End plug Drip tape"
      // If it exists but is already assigned to a DIFFERENT location, we need a new item.
      // Easiest is to find the first one that is unassigned, OR create it.
      const realItemName = itemName.replace(' - (Variant 2)', '');
      
      let item = await prisma.barang.findFirst({
        where: { nama: realItemName, lokasiGudangId: null }
      });

      if (!item) {
        // Create new
        const sku = `IRG-RK1${baris}${keranjang}-${Date.now().toString().slice(-4)}`;
        item = await prisma.barang.create({
          data: {
            nama: realItemName,
            sku: sku,
            jumlah: 0,
            kategoriId: kat?.id || 1, // fallback
            lokasiGudangId: loc.id
          }
        });
        console.log(`  [v] Dibuat & dimasukkan ke ${locName}: ${realItemName}`);
      } else {
        await prisma.barang.update({
          where: { id: item.id },
          data: { lokasiGudangId: loc.id }
        });
        console.log(`  [v] Dimasukkan ke ${locName}: ${realItemName}`);
      }
    }
  }
  
  console.log('\nSelesai! Mapping barang sudah 1-to-1 dengan slot.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
