import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLokasiGudangDto } from './dto/create-lokasi-gudang.dto';
import { UpdateLokasiGudangDto } from './dto/update-lokasi-gudang.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LokasiGudangService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLokasiGudangDto: CreateLokasiGudangDto) {
    return this.prisma.lokasiGudang.create({
      data: createLokasiGudangDto,
    });
  }

  async findAll() {
    return this.prisma.lokasiGudang.findMany({
      include: {
        _count: {
          select: { barang: true },
        },
      },
      orderBy: {
        zona: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const lokasi = await this.prisma.lokasiGudang.findUnique({
      where: { id },
    });
    if (!lokasi) {
      throw new NotFoundException(`Lokasi Gudang with ID ${id} not found`);
    }
    return lokasi;
  }

  async update(id: number, updateLokasiGudangDto: UpdateLokasiGudangDto) {
    await this.findOne(id); // Check existence
    return this.prisma.lokasiGudang.update({
      where: { id },
      data: updateLokasiGudangDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check existence
    return this.prisma.lokasiGudang.delete({
      where: { id },
    });
  }
}
