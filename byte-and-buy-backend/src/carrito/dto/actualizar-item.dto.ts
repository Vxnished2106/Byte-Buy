/**
 * DTO para actualizar la cantidad de un ítem del carrito
 */
import { IsInt, Min } from 'class-validator';

/**
 * DTO que contiene los datos para actualizar la cantidad de un producto en el carrito
 */
export class ActualizarItemDto {
  /** Nueva cantidad del producto (mínimo 1) */
  @IsInt()
  @Min(1)
  cantidad: number;
}
