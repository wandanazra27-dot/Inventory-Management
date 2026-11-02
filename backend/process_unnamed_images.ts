const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  const folderName = process.argv[2] || 'List Product #1';
  const imagesDir = path.join(__dirname, '../' + folderName);
  if (!fs.existsSync(imagesDir)) {
    console.error('Directory not found:', imagesDir);
    return;
  }

  // Get all items from DB to use as a dictionary
  const barangList = await prisma.barang.findMany({
    select: { id: true, nama: true }
  });

  const barangDictString = barangList.map(b => `${b.id}: ${b.nama}`).join('\n');

  console.log(`Loaded ${barangList.length} items from database.`);

  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${files.length} images to process.`);

  let successCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imagesDir, file);
    
    console.log(`\n[${i+1}/${files.length}] Processing ${file}...`);
    
    let retryCount = 0;
    let success = false;
    
    while (!success && retryCount < 5) {
      try {
        const imageData = fs.readFileSync(filePath);
        const base64Data = imageData.toString('base64');
        const mimeType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const prompt = `You are an inventory assistant. 
I have a list of items in my warehouse database. Here is the list (Format: ID: Item Name):
---
${barangDictString}
---

Look closely at the provided image.
Which item from the list above BEST matches the object in the image?
Respond ONLY with the integer ID of the best matching item. Do not write any other text or explanation. If you are absolutely unsure and none of the items match, reply with 0.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [{ inlineData: { data: base64Data, mimeType: mimeType } }, prompt]
        });

        const replyText = response.text.trim();
        const matchedId = parseInt(replyText, 10);

        if (!isNaN(matchedId) && matchedId > 0) {
          const matchedItem = barangList.find(b => b.id === matchedId);
          if (matchedItem) {
            console.log(`✅ Matched with ID ${matchedId}: ${matchedItem.nama}`);
            
            // Save the image
            const ext = path.extname(file);
            const newFileName = `tkpd_${matchedId}${ext}`;
            const newFilePath = path.join(uploadsDir, newFileName);
            
            fs.copyFileSync(filePath, newFilePath);
            
            // Update database
            await prisma.barang.update({
              where: { id: matchedId },
              data: { urlGambar: `/uploads/${newFileName}` }
            });
            
            // Move original file to 'processed' folder
            const processedDir = path.join(imagesDir, 'processed');
            if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir);
            fs.renameSync(filePath, path.join(processedDir, file));
            
            successCount++;
          } else {
            console.log(`❌ Returned ID ${matchedId} not found in database.`);
            skippedCount++;
          }
        } else {
          console.log(`⚠️ AI returned: ${replyText} (Unmatched)`);
          skippedCount++;
        }
        success = true; // success
      } catch (error) {
        if (error.status === 429 || error.message.includes('429')) {
           console.log(`Rate limit hit! Sleeping for 60 seconds before retrying ${file}...`);
           await new Promise(r => setTimeout(r, 60000));
           retryCount++;
        } else {
           console.error(`Error processing ${file}:`, error.message);
           skippedCount++;
           success = true; // stop retrying for other errors
        }
      }
    }

    // Delay to avoid hitting rate limits too fast (15 RPM = 4 seconds per request)
    await new Promise(r => setTimeout(r, 4000));
  }

  console.log(`\n=========================================`);
  console.log(`Process Complete!`);
  console.log(`Successfully mapped and updated: ${successCount} images.`);
  console.log(`Skipped / Failed: ${skippedCount} images.`);
  console.log(`=========================================`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
