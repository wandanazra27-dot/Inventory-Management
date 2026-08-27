import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchBarang(query: string) {
    if (query && query.trim() !== '') {
      this.prisma.riwayatpencarian.create({
        data: { kataKunci: query.trim() },
      }).catch(err => console.error('Failed to save search history', err));
    }

    if (!query || query.trim() === '') {
      return [];
    }

    const keyword = query.trim().toLowerCase();
    
    // Get all matches
    const results = await this.prisma.barang.findMany({
      where: {
        OR: [
          { sku: { contains: keyword, mode: 'insensitive' } },
          { nama: { contains: keyword, mode: 'insensitive' } },
          { deskripsi: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      include: {
        kategori: true,
        lokasigudang: true,
      },
    });

    // Sort by relevance
    return results.sort((a, b) => {
      const aName = a.nama.toLowerCase();
      const bName = b.nama.toLowerCase();
      const aDesc = (a.deskripsi || '').toLowerCase();
      const bDesc = (b.deskripsi || '').toLowerCase();

      const getScore = (name: string, desc: string) => {
        if (name === keyword) return 100; // Exact name match
        if (name.startsWith(`${keyword} `)) return 80; // Starts with keyword as a separate word
        if (name.includes(` ${keyword} `) || name.endsWith(` ${keyword}`)) return 70; // Contains keyword as a separate word
        if (name.includes(keyword)) return 50; // Name contains substring
        if (desc.includes(` ${keyword} `)) return 30; // Description contains keyword as word
        return 10; // Description contains substring
      };

      return getScore(bName, bDesc) - getScore(aName, aDesc);
    });
  }
}
