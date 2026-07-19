import { IsString } from 'class-validator';
export class CreateMetodoPagoDto {

  @IsString()
  metodo_pago_nombre: string;
}
