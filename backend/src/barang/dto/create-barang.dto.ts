import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBarangDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  jumlah?: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  kategoriId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  lokasiGudangId?: number;

  @IsString()
  @IsOptional()
  urlGambar?: string;
}
