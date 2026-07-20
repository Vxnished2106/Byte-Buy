/**
 * DTO de respuesta para una venta.
 */
export class ResponseVentaDto {
  /** ID único de la venta. */
  venta_id: number;

  /** ID del usuario que realizó la venta. */
  usuario_id: number;

  /** ID del carrito a partir del cual se generó la venta (opcional). */
  carrito_id: number | null;

  /** Fecha en la que se registró la venta. */
  venta_fecha: Date;

  /** Monto total de la venta. */
  venta_monto: number;

  /** Estado actual de la venta (ej. pendiente, aprobado). */
  venta_estado: string;
}
