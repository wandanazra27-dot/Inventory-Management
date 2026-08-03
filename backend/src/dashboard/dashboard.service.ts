import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // Get today's start and end date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run queries in parallel for better performance
    const [
      totalItem,
      totalLokasi,
      stokAggregation,
      scanHariIni,
      searchHariIni,
      riwayatVisual,
      riwayatTeks,
    ] = await Promise.all([
      this.prisma.barang.count(),
      this.prisma.lokasiGudang.count(),
      this.prisma.barang.aggregate({
        _sum: {
          jumlah: true,
        },
      }),
      this.prisma.riwayatScan.count({
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatPencarian.count({
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatScan.findMany({
        take: 5,
        orderBy: { dibuatPada: 'desc' },
      }),
      this.prisma.riwayatPencarian.findMany({
        take: 5,
        orderBy: { dibuatPada: 'desc' },
      }),
    ]);

    return {
      totalItem,
      totalLokasi,
      totalStok: stokAggregation._sum.jumlah || 0,
      scanHariIni,
      searchHariIni,
      riwayatVisual,
      riwayatTeks,
    };
  }
}
