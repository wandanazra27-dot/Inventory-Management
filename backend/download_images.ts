import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error: Error | null = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) resolve(true);
      });
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return false;
  }
}

async function main() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Find all items with hotlinked images
  const items = (await prisma.barang.findMany({
    where: {
      urlGambar: {
        not: null
      }
    }
  })).filter(item => item.urlGambar?.startsWith('http'));

  console.log(`Found ${items.length} items with hotlinked images. Starting download...`);

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const url = item.urlGambar!;
    // Get extension (usually jpg or webp)
    let ext = '.jpg';
    if (url.includes('.webp')) ext = '.webp';
    if (url.includes('.png')) ext = '.png';
    
    const filename = `tkpd_${item.id}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    console.log(`[${i + 1}/${items.length}] Downloading image for ${item.nama}...`);
    
    const success = await downloadImage(url, filepath);
    
    if (success) {
      await prisma.barang.update({
        where: { id: item.id },
        data: { urlGambar: `/uploads/${filename}` }
      });
      successCount++;
    } else {
      failedCount++;
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDownload Complete!`);
  console.log(`Successfully downloaded: ${successCount}`);
  console.log(`Failed: ${failedCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
