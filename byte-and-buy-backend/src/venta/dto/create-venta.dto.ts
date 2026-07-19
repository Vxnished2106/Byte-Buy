import { IsInt, IsNumber } from 'class-validator';

export class CreateVentaDto {
  @IsInt()
  carrito_id: number;

  @IsNumber()
  venta_monto: number;
}