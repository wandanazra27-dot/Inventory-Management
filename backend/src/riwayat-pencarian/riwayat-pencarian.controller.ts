import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RiwayatPencarianService } from './riwayat-pencarian.service';
import { CreateRiwayatPencarianDto } from './dto/create-riwayat-pencarian.dto';
import { UpdateRiwayatPencarianDto } from './dto/update-riwayat-pencarian.dto';

@Controller('riwayat-pencarian')
export class RiwayatPencarianController {
  constructor(private readonly riwayatPencarianService: RiwayatPencarianService) {}

  @Post()
  create(@Body() createRiwayatPencarianDto: CreateRiwayatPencarianDto) {
    return this.riwayatPencarianService.create(createRiwayatPencarianDto);
  }

  @Get()
  findAll() {
    return this.riwayatPencarianService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.riwayatPencarianService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRiwayatPencarianDto: UpdateRiwayatPencarianDto) {
    return this.riwayatPencarianService.update(+id, updateRiwayatPencarianDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.riwayatPencarianService.remove(+id);
  }
}
