import { Injectable } from '@nestjs/common';
import { CreateRiwayatPencarianDto } from './dto/create-riwayat-pencarian.dto';
import { UpdateRiwayatPencarianDto } from './dto/update-riwayat-pencarian.dto';

@Injectable()
export class RiwayatPencarianService {
  create(createRiwayatPencarianDto: CreateRiwayatPencarianDto) {
    return 'This action adds a new riwayatPencarian';
  }

  findAll() {
    return `This action returns all riwayatPencarian`;
  }

  findOne(id: number) {
    return `This action returns a #${id} riwayatPencarian`;
  }

  update(id: number, updateRiwayatPencarianDto: UpdateRiwayatPencarianDto) {
    return `This action updates a #${id} riwayatPencarian`;
  }

  remove(id: number) {
    return `This action removes a #${id} riwayatPencarian`;
  }
}
