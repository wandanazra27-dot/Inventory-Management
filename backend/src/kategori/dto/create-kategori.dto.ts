import { IsString, IsNotEmpty } from 'class-validator';

export class CreateKategoriDto {
  @IsString()
  @IsNotEmpty()
  nama: string;
}
