const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.eparhjrgyfxnosdmduxl:GudangRahasia123!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
});

async function test() {
  try {
    await client.connect();
    console.log("Connected to 6543!");
    const res = await client.query('SELECT NOW()');
    console.log(res.rows);
    await client.end();
  } catch (e) {
    console.error("Error 6543:", e);
  }
}

const client2 = new Client({
  connectionString: 'postgresql://postgres.eparhjrgyfxnosdmduxl:GudangRahasia123!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

async function test2() {
  try {
    await client2.connect();
    console.log("Connected to 5432!");
    const res = await client2.query('SELECT NOW()');
    console.log(res.rows);
    await client2.end();
  } catch (e) {
    console.error("Error 5432:", e);
  }
}

async function main() {
  console.log("Testing 6543...");
  await test();
  console.log("\nTesting 5432...");
  await test2();
}

main();
