/**
 * DTO para la asignación de un proveedor a un producto
 */
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO que contiene los datos necesarios para asignar un proveedor a un producto
 */
export class AsignarProveedorDto {
  /** Identificador del producto */
  @IsInt()
  producto_id: number;

  /** Identificador del proveedor */
  @IsInt()
  proveedor_id: number;

  /** Código de referencia del producto en el proveedor (opcional) */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  producto_proveedor_codigo?: string;

  /** Precio de compra del producto en este proveedor */
  @IsNumber()
  @Min(0)
  producto_proveedor_precio: number;
}