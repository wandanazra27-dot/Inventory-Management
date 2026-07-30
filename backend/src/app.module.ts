import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BarangModule } from './barang/barang.module';
import { KategoriModule } from './kategori/kategori.module';
import { LokasiGudangModule } from './lokasi-gudang/lokasi-gudang.module';
import { RiwayatScanModule } from './riwayat-scan/riwayat-scan.module';
import { RiwayatPencarianModule } from './riwayat-pencarian/riwayat-pencarian.module';

@Module({
  imports: [PrismaModule, BarangModule, KategoriModule, LokasiGudangModule, RiwayatScanModule, RiwayatPencarianModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
