/**
 * DTO de respuesta para un inventario
 */

/**
 * DTO que contiene los datos de respuesta de un inventario
 */
export class ResponseInventarioDto {
  /** Identificador único del inventario */
  inventario_id: number;

  /** Identificador del producto asociado al inventario */
  producto_id: number;

  /** Stock actual disponible del producto */
  inventario_stock_actual: number;

  /** Stock mínimo para generar alertas */
  inventario_stock_minimo: number;

  /** Fecha de última actualización del inventario */
  inventario_fecha_actualizacion: Date;
}