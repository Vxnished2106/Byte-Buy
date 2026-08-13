import { IsInt, IsNumber, IsOptional } from 'class-validator';

/**
 * DTO para el registro de una venta.
 */
export class CreateVentaDto {
  /**
   * ID del carrito a partir del cual se genera la venta. Opcional: una venta
   * puede originarse de otra fuente (ej. al finalizar un pedido en BORRADOR),
   * en cuyo caso no hay carrito asociado.
   */
  @IsOptional()
  @IsInt()
  carrito_id?: number;

  /** Monto total de la venta. */
  @IsNumber()
  venta_monto: number;
}
