import { Module } from '@nestjs/common';
import { LokasiGudangService } from './lokasi-gudang.service';
import { LokasiGudangController } from './lokasi-gudang.controller';

@Module({
  controllers: [LokasiGudangController],
  providers: [LokasiGudangService],
})
export class LokasiGudangModule {}
