import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AsignarProveedorDto {
  @IsInt()
  producto_id: number;

  @IsInt()
  proveedor_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  producto_proveedor_codigo?: string;

  @IsNumber()
  @Min(0)
  producto_proveedor_precio: number;
}