import { PartialType } from '@nestjs/mapped-types';
import { CreateRiwayatScanDto } from './create-riwayat-scan.dto';

export class UpdateRiwayatScanDto extends PartialType(CreateRiwayatScanDto) {}
