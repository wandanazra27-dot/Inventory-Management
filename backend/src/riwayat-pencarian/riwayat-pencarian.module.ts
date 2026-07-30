import { Module } from '@nestjs/common';
import { RiwayatPencarianService } from './riwayat-pencarian.service';
import { RiwayatPencarianController } from './riwayat-pencarian.controller';

@Module({
  controllers: [RiwayatPencarianController],
  providers: [RiwayatPencarianService],
})
export class RiwayatPencarianModule {}
