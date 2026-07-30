import { PartialType } from '@nestjs/mapped-types';
import { CreateRiwayatPencarianDto } from './create-riwayat-pencarian.dto';

export class UpdateRiwayatPencarianDto extends PartialType(CreateRiwayatPencarianDto) {}
