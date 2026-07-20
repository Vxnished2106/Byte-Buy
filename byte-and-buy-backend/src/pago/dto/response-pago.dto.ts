/**
 * DTO de respuesta para un pago.
 */
export class ResponsePagoDto {
  /** ID único del pago. */
  pago_id: number;

  /** ID de la venta a la que corresponde el pago. */
  venta_id: number;

  /** ID del método de pago utilizado. */
  metodo_pago_id: number;

  /** Monto pagado. */
  pago_monto: number;

  /** Fecha en la que se registró el pago. */
  pago_fecha: Date;

  /** Estado actual del pago (ej. pendiente, aprobado). */
  pago_estado: string;

  /** Detalle adicional del pago (opcional). */
  pago_detalle: any | null;
}
