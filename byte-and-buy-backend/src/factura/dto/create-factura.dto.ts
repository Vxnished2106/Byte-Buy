import { IsInt } from 'class-validator';

export class CreateFacturaDto {

  @IsInt()
  venta_id: number;

  @IsInt()
  pago_id: number;
  
}
