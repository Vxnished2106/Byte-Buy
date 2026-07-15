import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateInventarioDto {
  @IsInt()
  producto_id: number;

  @IsNumber()
  @Min(0)
  inventario_stock_actual: number;

  @IsNumber()
  @Min(0)
  inventario_stock_minimo: number;
}