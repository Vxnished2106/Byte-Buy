/**
 * DTO para agregar un ítem al carrito
 */
import { IsInt, Min } from 'class-validator';

/**
 * DTO que contiene los datos para agregar un producto al carrito
 */
export class AgregarItemDto {
  /** Identificador del producto a agregar */
  @IsInt()
  producto_id: number;

  /** Cantidad del producto a agregar (mínimo 1) */
  @IsInt()
  @Min(1)
  cantidad: number;
}
