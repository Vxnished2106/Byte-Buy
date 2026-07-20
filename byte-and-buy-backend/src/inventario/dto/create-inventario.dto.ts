/**
 * DTO para la creación de un inventario
 */
import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * DTO que contiene los datos necesarios para crear un inventario
 */
export class CreateInventarioDto {
  /** Identificador del producto asociado al inventario */
  @IsInt()
  producto_id: number;

  /** Stock actual inicial del producto */
  @IsNumber()
  @Min(0)
  inventario_stock_actual: number;

  /** Stock mínimo para generar alertas */
  @IsNumber()
  @Min(0)
  inventario_stock_minimo: number;
}