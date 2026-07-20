/**
 * DTO para la creación de un producto
 */
import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
} from 'class-validator';

import { ProductoEstado } from '../entities/producto.entity';

/**
 * DTO que contiene los datos necesarios para crear un producto
 */
export class CreateProductoDto {

  /** Nombre del producto */
  @IsString()
  producto_nombre: string;

  /** Descripción detallada del producto (opcional) */
  @IsOptional()
  @IsString()
  producto_descripcion?: string;

  /** Precio base del producto */
  @Type(() => Number)
  @IsNumber()
  producto_precio: number;

  /** Porcentaje de impuesto aplicado al producto (opcional) */
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  producto_impuesto?: number;

  /** Porcentaje de descuento aplicado al producto (opcional) */
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  producto_descuento?: number;

  /** URL de la imagen principal del producto (opcional) */
  @IsOptional()
  @IsString()
  producto_imagen?: string | null;

  /** URL del banner del producto (opcional) */
  @IsOptional()
  @IsString()
  producto_banner?: string | null;

  /** Estado del producto (opcional, por defecto activo) */
  @IsOptional()
  @IsEnum(ProductoEstado)
  producto_estado?: ProductoEstado;

  /** Identificadores de categorías asociadas al producto (opcional) */
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }

    return value
      .split(',')
      .map((v) => Number(v.trim()));
  })
  @IsArray()
  @IsInt({ each: true })
  categoria_ids?: number[];

  /** Identificadores de etiquetas asociadas al producto (opcional) */
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }

    return value
      .split(',')
      .map((v) => Number(v.trim()));
  })
  @IsArray()
  @IsInt({ each: true })
  etiqueta_ids?: number[];
}