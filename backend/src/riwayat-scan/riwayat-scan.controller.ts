import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RiwayatScanService } from './riwayat-scan.service';
import { CreateRiwayatScanDto } from './dto/create-riwayat-scan.dto';
import { UpdateRiwayatScanDto } from './dto/update-riwayat-scan.dto';

@Controller('riwayat-scan')
export class RiwayatScanController {
  constructor(private readonly riwayatScanService: RiwayatScanService) {}

  @Post()
  create(@Body() createRiwayatScanDto: CreateRiwayatScanDto) {
    return this.riwayatScanService.create(createRiwayatScanDto);
  }

  @Get()
  findAll() {
    return this.riwayatScanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.riwayatScanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRiwayatScanDto: UpdateRiwayatScanDto) {
    return this.riwayatScanService.update(+id, updateRiwayatScanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.riwayatScanService.remove(+id);
  }
}
