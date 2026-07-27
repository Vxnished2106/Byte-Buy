export class ResponseDetalleCompraDto {
  detalle_compra_id: number;

  venta_id: number;

  producto_id: number;

  producto?: {
    producto_id: number;
    producto_nombre: string;
    producto_descripcion: string | null;
    producto_imagen: string | null;
  };

  detalle_compra_cantidad: number;

  /**
   * Precio original del producto
   * al momento de realizar la compra.
   */
  detalle_compra_precio_unitario: number;

  /**
   * Porcentaje de descuento aplicado.
   */
  detalle_compra_descuento: number;

  /**
   * Porcentaje de impuesto aplicado.
   */
  detalle_compra_impuesto: number;

  /**
   * Cantidad × precio unitario.
   * No incluye descuento ni impuesto.
   */
  detalle_compra_subtotal: number;

  /**
   * Total final de la línea:
   * subtotal - descuento + impuesto.
   */
  detalle_compra_total: number;

  created_at: Date;

  updated_at: Date;
}