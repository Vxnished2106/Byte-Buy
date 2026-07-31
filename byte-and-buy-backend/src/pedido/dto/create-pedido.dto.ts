import {
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  Min,
  Max,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO de una línea del pedido en la creación/edición.
 *
 * `precio_unitario` y `descuento_pct` son opcionales: si no llegan, el servidor
 * usa el precio del catálogo y 0 % de descuento. La validación aquí es solo de
 * forma/rango; las invariantes de negocio (producto activo, stock, etc.) viven
 * en el servicio.
 */
export class PedidoItemDto {
  /** ID del producto de la línea. */
  @IsInt()
  producto_id: number;

  /** Cantidad pedida (entera y >= 1). */
  @IsInt()
  @Min(1)
  cantidad: number;

  /** Precio unitario propuesto (opcional; el servidor puede sobrescribirlo). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario?: number;

  /** Porcentaje de descuento de la línea (0–100). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  descuento_pct?: number;
}

/**
 * DTO para la creación de un pedido.
 *
 * Los totales NO se reciben del cliente: el servidor los recalcula siempre a
 * partir de las líneas y del catálogo. La clave de idempotencia viaja por el
 * header `Idempotency-Key`, no en el cuerpo.
 */
export class CreatePedidoDto {
  /** ID del usuario cliente para quien es el pedido. */
  @IsInt()
  cliente_id: number;

  /** Fecha de negocio del pedido (ISO 8601). Por defecto, la fecha actual. */
  @IsOptional()
  @IsDateString()
  pedido_fecha?: string;

  /** Notas opcionales de la cabecera. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  pedido_notas?: string;

  /** ID de la dirección de envío (requerida al confirmar, opcional en BORRADOR). */
  @IsOptional()
  @IsInt()
  direccion_envio_id?: number;

  /** Líneas del pedido (al menos una). */
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}
