import { Injectable } from '@nestjs/common';
import { CreateRiwayatScanDto } from './dto/create-riwayat-scan.dto';
import { UpdateRiwayatScanDto } from './dto/update-riwayat-scan.dto';

@Injectable()
export class RiwayatScanService {
  create(createRiwayatScanDto: CreateRiwayatScanDto) {
    return 'This action adds a new riwayatScan';
  }

  findAll() {
    return `This action returns all riwayatScan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} riwayatScan`;
  }

  update(id: number, updateRiwayatScanDto: UpdateRiwayatScanDto) {
    return `This action updates a #${id} riwayatScan`;
  }

  remove(id: number) {
    return `This action removes a #${id} riwayatScan`;
  }
}
