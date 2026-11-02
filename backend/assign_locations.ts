import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const dataMap = {
  "RK1-1.1": [
    "Valve 16mm×12inch - flow control/stop kran selang 16mm",
    "Drip tape valve - male thread",
    "Check valve 1/2 inch drat (female/betina) ke selang PE 16 mm/13 mm",
    "mini valve 16mm stop kran ke selang PE 13mm/16mm (1/2\") check valve",
    "Check valve 11mm/mini valve selang ke selang 11 mm/stop kran 11mm",
    "Drip tape valve - male thread / konektor keran selang Drip tape",
    "Drip tape valve - male trip 3/4"
  ],
  "RK1-1.2": [
    "Drip tape connector - PE House 16mm",
    "Drip tape connector - PE House 16mm (seal tape)",
    "End plug Drip tape/tutup selang Drip tape",
    "Dripper Emiter 8L/H drip irigasi tetes",
    "Dripper Emiter 4L/H Drip irigasi tetes",
    "Drippee Emiter 2L/H Drip irigasi tetes",
    "universal tap adapter quick connector kran keran konektor selang air"
  ],
  "RK1-1.3": [
    "Quick connector male 2 ways valve to female thread 3/4\" & 1/2\"",
    "End plug Drip tape/tutup selang Drip tape",
    "Quick connector 7mm/quick disconnect/konektor kran/quick release",
    "konektor selang air cabang 2 ukuran 3/4\" untuk irigasi kebun/keran Y"
  ],
  "RK1-1.4": [
    "connector Tee male thread/konektor T drat 16 mm to 1/2\"",
    "barb connector 16 mm",
    "konektor pipa PVC 1/2\" selang 7mm male thread 7mm drat connector 4/7",
    "Connector Elbow selang PE 11mm/8mm"
  ]
};

async function main() {
  for (const [locName, items] of Object.entries(dataMap)) {
    console.log(`\nMemproses penempatan ke: ${locName}`);
    
    // Find the actual location in the DB
    const loc = await prisma.lokasigudang.findUnique({ where: { nama: locName } });
    if (!loc) {
      console.log(`[!] Lokasi ${locName} tidak ditemukan di database! Melewati...`);
      continue;
    }

    // Update each item
    for (const itemName of items) {
      const existingItem = await prisma.barang.findFirst({ where: { nama: itemName } });
      if (existingItem) {
        await prisma.barang.update({
          where: { id: existingItem.id },
          data: { lokasiGudangId: loc.id }
        });
        console.log(`  [v] Berhasil dialokasikan: ${itemName}`);
      } else {
        console.log(`  [!] Barang tidak ditemukan: ${itemName}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
