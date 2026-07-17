import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export enum MetodoPago {
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
}

export class ValidarPagoDto {
  @IsEnum(MetodoPago, {
    message: 'Método de pago no soportado',
  })
  metodo_pago: MetodoPago;

  // Se acepta con espacios o guiones; el servicio los limpia antes de validar.
  @IsString()
  @IsNotEmpty()
  numero_tarjeta: string;

  @IsString()
  @IsNotEmpty()
  cvv: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}(\d{2})?$/, {
    message: 'Fecha de expiración inválida (formato MM/YY o MM/YYYY)',
  })
  fecha_expiracion: string;

  @IsString()
  @IsNotEmpty()
  nombre_titular: string;
}
