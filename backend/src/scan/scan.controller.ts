import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Nama field di form-data harus 'file'
  async uploadScan(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Gambar tidak ditemukan dalam request.');
    }
    return this.scanService.processVisualScan(file);
  }
}
