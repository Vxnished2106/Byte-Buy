import {
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

/**
 * DTO para el registro de un pago.
 */
export class CreatePagoDto {
  /** ID de la venta a la que corresponde el pago. */
  @IsInt()
  venta_id: number;

  /** ID del método de pago utilizado. */
  @IsInt()
  metodo_pago_id: number;

  /** Monto pagado. */
  @IsNumber()
  pago_monto: number;

  /** Detalle adicional del pago (opcional). */
  @IsOptional()
  pago_detalle?: any;
}
