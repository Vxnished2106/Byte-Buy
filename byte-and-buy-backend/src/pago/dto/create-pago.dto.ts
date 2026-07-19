import {
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreatePagoDto {
  @IsInt()
  venta_id: number;

  @IsInt()
  metodo_pago_id: number;

  @IsNumber()
  pago_monto: number;

  @IsOptional()
  pago_detalle?: any;
}