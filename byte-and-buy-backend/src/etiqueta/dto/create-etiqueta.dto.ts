import {
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO para la creación de una etiqueta.
 */
export class CreateEtiquetaDto {
  /** Nombre de la etiqueta. */
  @IsString()
  @MaxLength(50)
  etiqueta_nombre: string;
}
