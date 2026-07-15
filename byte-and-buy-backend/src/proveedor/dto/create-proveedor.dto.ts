import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @MaxLength(100)
  proveedor_nombre: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  proveedor_correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  proveedor_telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  proveedor_direccion?: string;
}