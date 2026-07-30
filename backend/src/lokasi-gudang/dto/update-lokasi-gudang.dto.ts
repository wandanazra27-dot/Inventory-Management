import { PartialType } from '@nestjs/mapped-types';
import { CreateLokasiGudangDto } from './create-lokasi-gudang.dto';

export class UpdateLokasiGudangDto extends PartialType(CreateLokasiGudangDto) {}
