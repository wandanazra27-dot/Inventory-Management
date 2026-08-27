import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class ScanService {
  constructor(private readonly prisma: PrismaService) { }

  async processVisualScan(file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File gambar tidak valid atau kosong.');
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new BadRequestException('GEMINI_API_KEY belum dikonfigurasi di backend.');
    }

    let detectedClass = '';
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Image = file.buffer.toString('base64');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: "Tolong identifikasi komponen hardware, alat pertukangan, atau pipa PVC apa yang ada di foto ini. Jawab dengan sangat singkat berupa NAMA BARANG UTAMA saja (misal: 'Pipa PVC', 'Kunci Inggris', 'Elbow', 'Tee'). JIKA gambar gelap gulita, hitam, buram, ATAU BUKAN komponen hardware, WAJIB jawab persis dengan kata: 'TIDAK_DIKETAHUI'." },
              {
                inlineData: {
                  mimeType: file.mimetype || 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ]
      });

      detectedClass = response.text || '';
      if (!detectedClass.trim() || detectedClass.includes('TIDAK_DIKETAHUI')) {
        throw new NotFoundException("AI tidak dapat mengidentifikasi objek pada gambar karena gambar tidak jelas atau bukan komponen.");
      }
      // Remove any trailing periods or newlines from AI output
      detectedClass = detectedClass.trim().replace(/[.\n]/g, '');

    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Gagal menghubungi server Gemini AI. Pastikan API Key valid dan koneksi internet stabil.");
    }

    // Fuzzy matching: Find the closest item in the database
    const allItems = await this.prisma.barang.findMany({
      include: {
        kategori: true,
        lokasigudang: true,
      },
    });

    // Clean and split the detected class into words (lowercase)
    // Exclude common color words from matching alone to prevent "hitam" matching "BOX Hitam" when AI says "hitam"
    const ignoreWords = ['hitam', 'putih', 'merah', 'biru', 'kuning', 'hijau', 'abu', 'warna', 'gambar', 'foto'];
    const detectedWords = detectedClass.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter((w: string) => w.length > 2 && !ignoreWords.includes(w));
    
    let bestMatch: any = null;
    let highestScore = 0;

    for (const item of allItems) {
      const itemName = item.nama.toLowerCase();
      let score = 0;
      for (const word of detectedWords) {
        if (itemName.includes(word)) {
          score++;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    // If we have at least 1 matching word, consider it a success
    if (!bestMatch || highestScore < 1) {
      return {
        success: false,
        message: `Tidak ada kecocokan di database.`,
        rawOutput: detectedClass,
        data: null
      };
    }

    const barang = bestMatch; 
    await this.prisma.riwayatscan.create({
      data: {
        jenis: 'VISUAL',
        jumlah: 1,
        catatan: `Identifikasi AI: "${detectedClass}"`,
        barangId: barang.id,
        lokasiGudangId: barang.lokasiGudangId,
      }
    });

    return {
      success: true,
      message: `Visual scan berhasil dideteksi`,
      rawOutput: detectedClass,
      confidence: 1.0,
      data: barang
    };
  }
}

