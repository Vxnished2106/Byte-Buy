/** Factura de una venta (`ResponseFacturaDto` del backend). */
export interface Factura {
  factura_id: number;
  venta_id: number;
  pago_id: number;
  factura_numero: string;
  /** Total calculado a partir de los detalles de compra de la venta. */
  factura_monto_total: number;
  factura_estado: string;
  /** Llega como string ISO (JSON no tiene tipo `Date`). */
  factura_fecha_creada: string;
  /** `null` mientras la factura no se haya enviado por correo. */
  factura_fecha_enviada: string | null;
  factura_enviada: boolean;
}

/** Datos para generar una factura (`POST /facturas`). */
export interface CreateFactura {
  venta_id: number;
  pago_id: number;
}

/** Datos editables de una factura (ej. cambiar `factura_estado` o `factura_enviada`). */
export type UpdateFactura = Partial<{
  factura_estado: string;
  factura_enviada: boolean;
}>;
