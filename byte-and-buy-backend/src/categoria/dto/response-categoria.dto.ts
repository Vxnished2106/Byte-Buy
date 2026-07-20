/**
 * DTO para la respuesta de datos de categoría.
 */
export class ResponseCategoriaDto {
  /** ID único de la categoría. */
  categoria_id: number;
  /** Nombre de la categoría. */
  categoria_nombre: string;
  /** Descripción de la categoría (opcional). */
  categoria_descripcion: string | null;
  /** URL de la imagen de la categoría (opcional). */
  categoria_imagen: string | null;
}