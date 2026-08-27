import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBarangDto } from './dto/create-barang.dto';
import { UpdateBarangDto } from './dto/update-barang.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BarangService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBarangDto: CreateBarangDto) {
    return this.prisma.barang.create({
      data: createBarangDto,
      include: {
        kategori: true,
        lokasigudang: true,
      },
    });
  }

  findAllKategori() {
    return this.prisma.kategori.findMany();
  }

  async findAll() {
    return this.prisma.barang.findMany({
      include: {
        kategori: true,
        lokasigudang: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const barang = await this.prisma.barang.findUnique({
      where: { id },
      include: {
        kategori: true,
        lokasigudang: true,
        riwayatscan: {
          orderBy: { dibuatPada: 'desc' }
        },
      },
    });
    if (!barang) {
      throw new NotFoundException(`Barang with ID ${id} not found`);
    }
    return barang;
  }

  async adjustStock(id: number, amount: number, jenis: string, catatan: string) {
    const barang = await this.findOne(id);
    
    let newStock = barang.jumlah;
    if (jenis === 'MASUK') {
      newStock += amount;
    } else if (jenis === 'KELUAR') {
      newStock -= amount;
      if (newStock < 0) {
        throw new Error('Stok tidak mencukupi');
      }
    }

    // Gunakan transaksi agar kedua operasi (update stok & catat riwayat) berhasil bersamaan
    return this.prisma.$transaction(async (prisma) => {
      const updatedBarang = await prisma.barang.update({
        where: { id },
        data: { jumlah: newStock },
      });

      await prisma.riwayatscan.create({
        data: {
          barangId: id,
          lokasiGudangId: barang.lokasiGudangId,
          jenis: jenis,
          jumlah: amount,
          catatan: catatan || 'Penyesuaian stok manual',
        }
      });

      return updatedBarang;
    });
  }

  async update(id: number, updateBarangDto: UpdateBarangDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.barang.update({
      where: { id },
      data: updateBarangDto,
      include: {
        kategori: true,
        lokasigudang: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists
    return this.prisma.barang.delete({
      where: { id },
    });
  }
}
