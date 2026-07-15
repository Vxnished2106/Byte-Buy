import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MaxLength(100)
  categoria_nombre: string;

  @IsOptional()
  @IsString()
  categoria_descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  categoria_imagen?: string | null;
}