import {
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEtiquetaDto {
  @IsString()
  @MaxLength(50)
  etiqueta_nombre: string;
}