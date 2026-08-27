import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BarangService } from './barang.service';
import { CreateBarangDto } from './dto/create-barang.dto';
import { UpdateBarangDto } from './dto/update-barang.dto';

@Controller('barang')
export class BarangController {
  constructor(private readonly barangService: BarangService) {}

  @Post()
  create(@Body() createBarangDto: CreateBarangDto) {
    return this.barangService.create(createBarangDto);
  }

  @Get('kategori/all')
  findAllKategori() {
    return this.barangService.findAllKategori();
  }

  @Get()
  findAll() {
    return this.barangService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barangService.findOne(+id);
  }

  @Post(':id/adjust')
  adjustStock(@Param('id') id: string, @Body() body: { jumlah: number, jenis: string, catatan: string }) {
    return this.barangService.adjustStock(+id, body.jumlah, body.jenis, body.catatan);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBarangDto: UpdateBarangDto) {
    return this.barangService.update(+id, updateBarangDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barangService.remove(+id);
  }
}
