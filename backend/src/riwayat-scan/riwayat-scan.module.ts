import { Module } from '@nestjs/common';
import { RiwayatScanService } from './riwayat-scan.service';
import { RiwayatScanController } from './riwayat-scan.controller';

@Module({
  controllers: [RiwayatScanController],
  providers: [RiwayatScanService],
})
export class RiwayatScanModule {}
