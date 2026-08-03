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
        lokasiGudang: true,
      },
    });
  }

  async findAll() {
    return this.prisma.barang.findMany({
      include: {
        kategori: true,
        lokasiGudang: true,
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
        lokasiGudang: true,
      },
    });
    if (!barang) {
      throw new NotFoundException(`Barang with ID ${id} not found`);
    }
    return barang;
  }

  async update(id: number, updateBarangDto: UpdateBarangDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.barang.update({
      where: { id },
      data: updateBarangDto,
      include: {
        kategori: true,
        lokasiGudang: true,
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
