import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  IsDateString,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PedidoEstado } from '../entities/pedido.entity';

/** Campos por los que se puede ordenar el listado de pedidos. */
export const CAMPOS_ORDEN_PEDIDO = [
  'pedido_fecha',
  'pedido_total',
  'pedido_numero',
  'created_at',
] as const;

/**
 * DTO de consulta del listado de pedidos.
 *
 * Todos los filtros, el orden y la paginación se resuelven en el servidor
 * (SQL), nunca en memoria. Los parámetros numéricos se transforman desde string
 * (query params) con `@Type(() => Number)`.
 */
export class ListarPedidosDto {
  /** Filtro por estado. */
  @IsOptional()
  @IsEnum(PedidoEstado)
  estado?: PedidoEstado;

  /** Filtro por cliente. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cliente_id?: number;

  /** Filtro: fecha de pedido desde (ISO 8601, inclusive). */
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  /** Filtro: fecha de pedido hasta (ISO 8601, inclusive). */
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  /** Búsqueda de texto sobre número de pedido y notas. */
  @IsOptional()
  @IsString()
  buscar?: string;

  /** Campo de ordenamiento. */
  @IsOptional()
  @IsIn(CAMPOS_ORDEN_PEDIDO)
  orden_por?: (typeof CAMPOS_ORDEN_PEDIDO)[number];

  /** Dirección de ordenamiento. */
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orden_dir?: 'ASC' | 'DESC';

  /** Número de página (1-based). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Tamaño de página (1–100). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
