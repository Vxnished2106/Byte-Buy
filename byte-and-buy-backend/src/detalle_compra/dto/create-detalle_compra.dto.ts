import { IsInt } from 'class-validator';

export class CreateDetalleCompraDto {
  @IsInt()
  venta_id: number;

  @IsInt()
  producto_id: number;

  @IsInt()
  cantidad: number;
}