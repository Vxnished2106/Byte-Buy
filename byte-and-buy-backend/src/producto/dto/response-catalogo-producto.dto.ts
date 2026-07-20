/**
 * DTO de respuesta para el catálogo de productos
 */

/**
 * DTO que contiene los datos básicos de un producto para el catálogo
 */
export class ResponseCatalogoProductoDto {
  /** Identificador único del producto */
  producto_id: number;

  /** Nombre del producto */
  producto_nombre: string;

  /** Precio base del producto */
  producto_precio: number;

  /** URL de la imagen principal del producto */
  producto_imagen: string | null;

  /** Indica si el producto está disponible (tiene stock) */
  disponible: boolean;
}