import { Module } from '@nestjs/common';
import { LokasiGudangService } from './lokasi-gudang.service';
import { LokasiGudangController } from './lokasi-gudang.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LokasiGudangController],
  providers: [LokasiGudangService],
})
export class LokasiGudangModule {}
