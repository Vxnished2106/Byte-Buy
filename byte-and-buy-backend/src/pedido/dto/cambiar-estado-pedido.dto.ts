import { IsInt, IsEnum, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PedidoEstado } from '../entities/pedido.entity';

/**
 * DTO para una transición de estado del pedido.
 *
 * `pedido_version` habilita el control de concurrencia optimista. La validez de
 * la transición (según la máquina de estados) y sus efectos colaterales
 * (stock, dirección requerida) se validan en el servicio.
 */
export class CambiarEstadoPedidoDto {
  /** Estado destino de la transición. */
  @IsEnum(PedidoEstado)
  nuevo_estado: PedidoEstado;

  /** Versión del pedido que el cliente tenía al cargar (concurrencia optimista). */
  @IsInt()
  @Min(0)
  pedido_version: number;

  /** Nota opcional asociada al cambio de estado. */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nota?: string;
}
