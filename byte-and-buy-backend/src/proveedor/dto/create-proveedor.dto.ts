import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
} from 'class-validator';

/**
 * DTO para la creación de un proveedor.
 */
export class CreateProveedorDto {
  /** Nombre del proveedor. */
  @IsString()
  @MaxLength(100)
  proveedor_nombre: string;

  /** Correo del proveedor (opcional). */
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  proveedor_correo?: string;

  /** Teléfono del proveedor (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  proveedor_telefono?: string;

  /** Dirección del proveedor (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  proveedor_direccion?: string;
}
