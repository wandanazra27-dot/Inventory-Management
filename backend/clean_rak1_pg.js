const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.eparhjrgyfxnosdmduxl:GudangRahasia123!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
});

const allowedItems = [
  "Valve 16mm×12inch - flow control/stop kran selang 16mm",
  "Drip tape valve - male thread",
  "Check valve 1/2 inch drat (female/betina) ke selang PE 16 mm/13 mm",
  "mini valve 16mm stop kran ke selang PE 13mm/16mm (1/2\") check valve",
  "Check valve 11mm/mini valve selang ke selang 11 mm/stop kran 11mm",
  "Drip tape valve - male thread / konektor keran selang Drip tape",
  "Drip tape valve - male trip 3/4",
  "Drip tape connector - PE House 16mm",
  "Drip tape connector - PE House 16mm (seal tape)",
  "End plug Drip tape/tutup selang Drip tape",
  "Dripper Emiter 8L/H drip irigasi tetes",
  "Dripper Emiter 4L/H Drip irigasi tetes",
  "Drippee Emiter 2L/H Drip irigasi tetes",
  "universal tap adapter quick connector kran keran konektor selang air",
  "Quick connector male 2 ways valve to female thread 3/4\" & 1/2\"",
  "Quick connector 7mm/quick disconnect/konektor kran/quick release",
  "konektor selang air cabang 2 ukuran 3/4\" untuk irigasi kebun/keran Y",
  "connector Tee male thread/konektor T drat 16 mm to 1/2\"",
  "barb connector 16 mm",
  "konektor pipa PVC 1/2\" selang 7mm male thread 7mm drat connector 4/7",
  "Connector Elbow selang PE 11mm/8mm"
];

async function main() {
  try {
    await client.connect();
    console.log("Connected to database!");

    // 1. Get all Rak 1 locations
    const locRes = await client.query("SELECT id, nama FROM \"Lokasigudang\" WHERE nama LIKE 'RK1-%'");
    const locIds = locRes.rows.map(r => r.id);
    console.log(`Found ${locIds.length} locations in Rak 1.`);

    if (locIds.length > 0) {
      // 2. Clear location for items in Rak 1 that are NOT in allowedItems
      const placeholders = allowedItems.map((_, i) => `$${i + 2}`).join(', ');
      const query = `
        UPDATE "Barang" 
        SET "lokasiGudangId" = NULL 
        WHERE "lokasiGudangId" = ANY($1::int[]) 
        AND nama NOT IN (${placeholders})
        RETURNING nama;
      `;
      const values = [locIds, ...allowedItems];
      
      const updateRes = await client.query(query, values);
      console.log(`Cleaned ${updateRes.rowCount} extra items from Rak 1:`);
      updateRes.rows.forEach(r => console.log(` - ${r.nama}`));
    }
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

main();
