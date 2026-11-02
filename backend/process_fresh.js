const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tokopedia.com/'
      }
    });
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => { error = err; writer.close(); reject(err); });
      writer.on('close', () => { if (!error) resolve(true); });
    });
  } catch (error) {
    console.error('Failed to download', url, ':', error.message);
    return false;
  }
}

async function run() {
  const data = JSON.parse(fs.readFileSync('./uploads/tokopedia_baru.json', 'utf8'));
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  let successCount = 0;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.nama.length < 5) continue; // skip noise

    // find in DB
    const dbItem = await prisma.barang.findFirst({
      where: { nama: { equals: item.nama, mode: 'insensitive' } }
    });

    if (dbItem && item.gambar) {
      const ext = item.gambar.includes('.png') ? '.png' : (item.gambar.includes('.webp') ? '.webp' : '.jpg');
      const filename = 'tkpd_' + dbItem.id + ext;
      const filepath = path.join(uploadsDir, filename);

      console.log('[' + (i+1) + '/' + data.length + '] Downloading ' + dbItem.nama);
      const success = await downloadImage(item.gambar, filepath);
      if (success) {
        await prisma.barang.update({
          where: { id: dbItem.id },
          data: { urlGambar: '/uploads/' + filename }
        });
        successCount++;
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
  console.log('Finished! Successfully downloaded:', successCount);
}
run().catch(console.error).finally(() => prisma.$disconnect());
