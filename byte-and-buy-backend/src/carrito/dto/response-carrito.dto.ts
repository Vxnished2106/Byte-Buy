/**
 * DTO de respuesta para el carrito
 */

/**
 * DTO que contiene los datos de un ítem del carrito para la respuesta
 */
export class ResponseCarritoItemDto {
  /** Identificador del producto */
  producto_id: number;
  /** Nombre del producto */
  producto_nombre: string;
  /** Precio de lista del producto */
  precio_unitario: number;
  /** Porcentaje de descuento aplicado */
  descuento: number;
  /** Porcentaje de impuesto aplicado */
  impuesto: number;
  /** Precio unitario ya con descuento e impuesto aplicados */
  precio_final_unitario: number;
  /** Cantidad del producto en el carrito */
  cantidad: number;
  /** Subtotal (precio_final_unitario * cantidad) */
  subtotal: number;
}

/**
 * DTO que contiene los datos completos del carrito para la respuesta
 */
export class ResponseCarritoDto {
  /** Identificador del carrito */
  carrito_id: number;
  /** Ítems del carrito */
  items: ResponseCarritoItemDto[];
  /** Total del carrito */
  total: number;
}
