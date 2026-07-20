import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * DTO para la creación de una categoría.
 */
export class CreateCategoriaDto {
  /** Nombre de la categoría. */
  @IsString()
  @MaxLength(100)
  categoria_nombre: string;

  /** Descripción de la categoría (opcional). */
  @IsOptional()
  @IsString()
  categoria_descripcion?: string;

  /** URL de la imagen de la categoría (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  categoria_imagen?: string | null;
}