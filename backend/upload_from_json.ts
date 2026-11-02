import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Supabase Configuration (Will be passed via ENV)
const supabaseUrl = process.env.SUPABASE_URL || 'https://eparhjrgyfxnosdmduxl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();
const BUCKET_NAME = 'barang';

async function uploadToSupabase(buffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: true
            });

        if (error) {
            console.error(`❌ Upload error for ${fileName}:`, error.message);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error(`❌ Unexpected error uploading ${fileName}:`, err);
        return null;
    }
}

function sanitizeFileName(name: string) {
    // Remove invalid characters for filenames
    return name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
}

async function main() {
    console.log("🚀 Memulai proses sinkronisasi JSON Tokopedia ke Supabase...");

    // 1. Load JSON data
    const jsonPath = path.join(__dirname, '..', 'tokopedia_lengkap.json');
    if (!fs.existsSync(jsonPath)) {
        console.error("❌ File tokopedia_lengkap.json tidak ditemukan!");
        process.exit(1);
    }
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const products: any[] = JSON.parse(rawData);
    console.log(`✅ Berhasil memuat ${products.length} data produk dari JSON.`);

    let successCount = 0;
    let failedCount = 0;

    // 2. Process each product
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product.gambar || !product.nama) {
            console.log(`⚠️ Melewati baris ke-${i+1} karena nama/gambar kosong.`);
            continue;
        }

        console.log(`\n[${i + 1}/${products.length}] Memproses: ${product.nama}`);
        
        try {
            // Find in database first to ensure it exists
            const dbItem = await prisma.barang.findFirst({
                where: { nama: product.nama }
            });

            if (!dbItem) {
                console.log(`⚠️ Produk "${product.nama}" tidak ditemukan di database Prisma. Lewati.`);
                failedCount++;
                continue;
            }

            // Download image
            console.log(`   ⬇️ Mendownload gambar dari Tokopedia...`);
            const response = await axios({
                url: product.gambar,
                method: 'GET',
                responseType: 'arraybuffer',
                timeout: 10000,
            });
            const buffer = Buffer.from(response.data);

            // Determine extension (Tokopedia uses webp heavily)
            let ext = '.jpg';
            if (product.gambar.includes('.webp')) ext = '.webp';
            else if (product.gambar.includes('.png')) ext = '.png';

            const cleanFileName = sanitizeFileName(product.nama) + ext;

            // Upload to Supabase
            console.log(`   ☁️ Mengupload ke Supabase Storage (Bucket: ${BUCKET_NAME}) dengan nama "${cleanFileName}"...`);
            const publicUrl = await uploadToSupabase(buffer, cleanFileName, (response.headers['content-type'] as string) || 'application/octet-stream');

            if (publicUrl) {
                // Update Prisma DB
                console.log(`   🔄 Update database dengan URL baru: ${publicUrl}`);
                await prisma.barang.update({
                    where: { id: dbItem.id },
                    data: { urlGambar: publicUrl }
                });
                console.log(`   ✅ Selesai untuk produk ini!`);
                successCount++;
            } else {
                failedCount++;
            }

        } catch (error: any) {
            console.error(`❌ Gagal memproses "${product.nama}":`, error.message);
            failedCount++;
        }

        // Delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🎉 PROSES SELESAI 🎉`);
    console.log(`Sukses: ${successCount}`);
    console.log(`Gagal: ${failedCount}`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
