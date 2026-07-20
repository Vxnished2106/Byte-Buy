import { IsInt, IsNumber } from 'class-validator';

/**
 * DTO para el registro de una venta.
 */
export class CreateVentaDto {
  /** ID del carrito a partir del cual se genera la venta. */
  @IsInt()
  carrito_id: number;

  /** Monto total de la venta. */
  @IsNumber()
  venta_monto: number;
}
