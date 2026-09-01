import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      url: `/uploads/${file.filename}`
    };
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
