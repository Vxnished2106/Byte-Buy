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

export class CreateProductoDto {

  @IsString()
  producto_nombre: string;

  @IsOptional()
  @IsString()
  producto_descripcion?: string;

  @Type(() => Number)
  @IsNumber()
  producto_precio: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  producto_impuesto?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  producto_descuento?: number;

  @IsOptional()
  @IsString()
  producto_imagen?: string | null;

  @IsOptional()
  @IsString()
  producto_banner?: string | null;

  @IsOptional()
  @IsEnum(ProductoEstado)
  producto_estado?: ProductoEstado;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map(Number)
      : value,
  )
  
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