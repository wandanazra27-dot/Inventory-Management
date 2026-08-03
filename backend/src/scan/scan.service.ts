import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScanService {
  constructor(private readonly prisma: PrismaService) {}

  async processVisualScan(file: any) {
    // 1. SIMULASI AI VISION (Mock)
    // Di masa depan, di sini kita mengirim 'file' ke API Roboflow
    // Untuk saat ini, kita pura-pura AI mendeteksi komponen tertentu secara acak 
    // dari 3 barang populer
    const mockDetectedSKUs = ['CLK-001', 'ATK-001', 'KMS-001'];
    const randomIdx = Math.floor(Math.random() * mockDetectedSKUs.length);
    const detectedSku = mockDetectedSKUs[randomIdx];

    // 2. Cari barang hasil deteksi di database
    const barang = await this.prisma.barang.findUnique({
      where: { sku: detectedSku },
      include: {
        kategori: true,
        lokasiGudang: true,
      }
    });

    if (!barang) {
      throw new NotFoundException(`AI mendeteksi SKU ${detectedSku} tapi tidak ada di database.`);
    }

    // 3. Catat aktivitas ini ke RiwayatScan agar muncul di Dashboard
    await this.prisma.riwayatScan.create({
      data: {
        jenis: 'VISUAL',
        jumlah: 1,
        catatan: `Identifikasi otomatis dengan AI Vision (File: ${file?.originalname || 'unknown'})`,
        barangId: barang.id,
        lokasiGudangId: barang.lokasiGudangId,
      }
    });

    // 4. Return hasil ke frontend
    return {
      message: 'Visual scan berhasil dideteksi',
      confidence: 0.98, // Mock confidence level
      data: barang
    };
  }
}
