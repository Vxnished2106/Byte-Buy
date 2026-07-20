/**
 * DTO para la actualización de un pago.
 */
export class UpdatePagoDto {
  /** Nuevo estado del pago (opcional). */
  pago_estado?: string;

  /** Nuevo detalle adicional del pago (opcional). */
  pago_detalle?: any;
}
