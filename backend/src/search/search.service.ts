import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchBarang(query: string) {
    // 1. Simpan riwayat pencarian (secara asynchronous agar tidak memblokir)
    if (query && query.trim() !== '') {
      this.prisma.riwayatPencarian.create({
        data: { kataKunci: query.trim() },
      }).catch(err => console.error('Failed to save search history', err));
    }

    // 2. Lakukan pencarian jika ada query
    if (!query || query.trim() === '') {
      return [];
    }

    const keyword = query.trim();
    return this.prisma.barang.findMany({
      where: {
        OR: [
          { sku: { contains: keyword } }, // Case-insensitive behavior in MySQL by default for VARCHAR
          { nama: { contains: keyword } },
          { deskripsi: { contains: keyword } },
        ],
      },
      include: {
        kategori: true,
        lokasiGudang: true,
      },
    });
  }
}
