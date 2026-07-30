/** Detalle de compra de una venta (`ResponseDetalleCompraDto` del backend). */
export interface DetalleCompra {
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
  /** Precio original del producto al momento de realizar la compra. */
  detalle_compra_precio_unitario: number;
  /** Porcentaje de descuento aplicado. */
  detalle_compra_descuento: number;
  /** Porcentaje de impuesto aplicado. */
  detalle_compra_impuesto: number;
  /** Cantidad × precio unitario. No incluye descuento ni impuesto. */
  detalle_compra_subtotal: number;
  /** Total final de la línea: subtotal - descuento + impuesto. */
  detalle_compra_total: number;
  /** Llegan como string ISO (JSON no tiene tipo `Date`). */
  created_at: string;
  updated_at: string;
}

/** Datos para registrar un detalle de compra (`POST /detalle-compra`). */
export interface CreateDetalleCompra {
  venta_id: number;
  producto_id: number;
  cantidad: number;
}

/** Datos editables de un detalle de compra (solo la cantidad). */
export interface UpdateDetalleCompra {
  cantidad?: number;
}
