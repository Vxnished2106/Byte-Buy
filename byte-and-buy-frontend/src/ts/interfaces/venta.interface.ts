/** Venta registrada para un usuario (`ResponseVentaDto` del backend). */
export interface Venta {
  venta_id: number;
  usuario_id: number;
  carrito_id: number | null;
  /** Llega como string ISO (JSON no tiene tipo `Date`). */
  venta_fecha: string;
  venta_monto: number;
  venta_estado: string;
}

/**
 * Datos para registrar una venta (`POST /ventas/registrar`). El
 * `usuario_id` lo resuelve el backend a partir del token de sesión, no se
 * envía desde el frontend.
 */
export interface CreateVenta {
  carrito_id: number;
  venta_monto: number;
}

/** Datos editables de una venta (ej. cambiar `venta_estado`). */
export type UpdateVenta = Partial<{ venta_monto: number; venta_estado: string }>;
