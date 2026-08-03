import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KategoriService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createKategoriDto: CreateKategoriDto) {
    return this.prisma.kategori.create({
      data: createKategoriDto,
    });
  }

  async findAll() {
    return this.prisma.kategori.findMany();
  }

  async findOne(id: number) {
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
    });
    if (!kategori) {
      throw new NotFoundException(`Kategori with ID ${id} not found`);
    }
    return kategori;
  }

  async update(id: number, updateKategoriDto: UpdateKategoriDto) {
    // Check if exists first
    await this.findOne(id);
    return this.prisma.kategori.update({
      where: { id },
      data: updateKategoriDto,
    });
  }

  async remove(id: number) {
    // Check if exists first
    await this.findOne(id);
    return this.prisma.kategori.delete({
      where: { id },
    });
  }
}
