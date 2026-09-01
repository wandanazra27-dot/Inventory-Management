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
      this.prisma.lokasigudang.count(),
      this.prisma.barang.aggregate({
        _sum: {
          jumlah: true,
        },
      }),
      this.prisma.riwayatscan.count({
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatpencarian.count({
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatscan.findMany({
        take: 5,
        orderBy: { dibuatPada: 'desc' },
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatpencarian.findMany({
        take: 5,
        orderBy: { dibuatPada: 'desc' },
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
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

  async getMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalBarang,
      totalLokasi,
      totalScanAI,
      totalPencarianHariIni,
      topPencarianGroups,
    ] = await Promise.all([
      this.prisma.barang.count(),
      this.prisma.lokasigudang.count(),
      this.prisma.riwayatscan.count({
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatpencarian.count({
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.riwayatpencarian.groupBy({
        by: ['kataKunci'],
        where: {
          dibuatPada: {
            gte: today,
            lt: tomorrow,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    return {
      totalBarang,
      totalLokasi,
      totalScanAI,
      totalPencarianHariIni,
      topPencarian: topPencarianGroups,
    };
  }
}
