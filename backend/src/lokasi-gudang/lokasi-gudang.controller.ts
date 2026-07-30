import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LokasiGudangService } from './lokasi-gudang.service';
import { CreateLokasiGudangDto } from './dto/create-lokasi-gudang.dto';
import { UpdateLokasiGudangDto } from './dto/update-lokasi-gudang.dto';

@Controller('lokasi-gudang')
export class LokasiGudangController {
  constructor(private readonly lokasiGudangService: LokasiGudangService) {}

  @Post()
  create(@Body() createLokasiGudangDto: CreateLokasiGudangDto) {
    return this.lokasiGudangService.create(createLokasiGudangDto);
  }

  @Get()
  findAll() {
    return this.lokasiGudangService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lokasiGudangService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLokasiGudangDto: UpdateLokasiGudangDto) {
    return this.lokasiGudangService.update(+id, updateLokasiGudangDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lokasiGudangService.remove(+id);
  }
}
