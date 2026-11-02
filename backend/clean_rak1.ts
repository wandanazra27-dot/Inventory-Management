import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
  console.log('Membersihkan barang-barang sisa di Rak 1...');
  
  const allItemNames = Object.values(dataMap).flat().map(n => n.replace(' - (Variant 2)', ''));
  
  // Find all items in Rak 1 (any location starting with RK1)
  const rak1Locations = await prisma.lokasigudang.findMany({
    where: { nama: { startsWith: 'RK1-' } }
  });
  
  const rak1LocIds = rak1Locations.map(l => l.id);

  // Unassign any item in Rak 1 that is NOT in our designated list
  const extraItems = await prisma.barang.findMany({
    where: {
      lokasiGudangId: { in: rak1LocIds },
      nama: { notIn: allItemNames }
    }
  });

  for (const item of extraItems) {
    await prisma.barang.update({
      where: { id: item.id },
      data: { lokasiGudangId: null }
    });
    console.log(`[Dihapus dari Rak 1] ${item.nama}`);
  }
  
  // Also fix duplicates: if any allowed item is assigned multiple times to Rak 1, 
  // wait, the previous script assigned EXACTLY 1 item per slot. If there are other items with the same name, we should make sure they aren't in Rak 1.
  
  console.log('\nPembersihan selesai!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
