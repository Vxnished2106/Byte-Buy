/**
 * DTO para la creación de un método de pago
 */
import { IsString } from 'class-validator';

/**
 * DTO que contiene los datos necesarios para crear un método de pago
 */
export class CreateMetodoPagoDto {
  /** Nombre del método de pago */
  @IsString()
  metodo_pago_nombre: string;
}
