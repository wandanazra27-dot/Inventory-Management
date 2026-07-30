import { Injectable } from '@nestjs/common';
import { CreateLokasiGudangDto } from './dto/create-lokasi-gudang.dto';
import { UpdateLokasiGudangDto } from './dto/update-lokasi-gudang.dto';

@Injectable()
export class LokasiGudangService {
  create(createLokasiGudangDto: CreateLokasiGudangDto) {
    return 'This action adds a new lokasiGudang';
  }

  findAll() {
    return `This action returns all lokasiGudang`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lokasiGudang`;
  }

  update(id: number, updateLokasiGudangDto: UpdateLokasiGudangDto) {
    return `This action updates a #${id} lokasiGudang`;
  }

  remove(id: number) {
    return `This action removes a #${id} lokasiGudang`;
  }
}
