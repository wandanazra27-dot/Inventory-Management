import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLokasiGudangDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsOptional()
  zona?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  kapasitas?: number;
}
