import {
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PedidoItemDto } from './create-pedido.dto';

/**
 * DTO para la edición de un pedido en estado BORRADOR.
 *
 * Reemplaza por completo el conjunto de líneas. `pedido_version` es obligatorio
 * y habilita el control de concurrencia optimista: si no coincide con la
 * versión persistida, el servicio responde 409 en vez de sobrescribir.
 */
export class UpdatePedidoDto {
  /** Versión del pedido que el cliente tenía al cargar (concurrencia optimista). */
  @IsInt()
  @Min(0)
  pedido_version: number;

  /** Fecha de negocio del pedido (ISO 8601). */
  @IsOptional()
  @IsDateString()
  pedido_fecha?: string;

  /** Notas opcionales de la cabecera. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  pedido_notas?: string;

  /** ID de la dirección de envío. */
  @IsOptional()
  @IsInt()
  direccion_envio_id?: number;

  /** Nuevo conjunto de líneas del pedido (al menos una). */
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}
