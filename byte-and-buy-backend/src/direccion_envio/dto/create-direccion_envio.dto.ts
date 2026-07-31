import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * DTO para el registro de una dirección de envío.
 */
export class CreateDireccionEnvioDto {
  /** ID de la ciudad de la dirección. */
  @IsInt()
  ciudad_id: number;

  /** Nombre de quien recibe el pedido. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  direccion_destinatario: string;

  /** Teléfono de contacto para la entrega. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  direccion_telefono: string;

  /** Calle y número de la dirección. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion_calle: string;

  /** Referencia adicional para ubicar la dirección (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion_referencia?: string;

  /** Código postal (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  direccion_codigo_postal?: string;
}
