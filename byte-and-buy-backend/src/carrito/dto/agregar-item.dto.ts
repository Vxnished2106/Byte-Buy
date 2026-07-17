import { IsInt, Min } from 'class-validator';

export class AgregarItemDto {
  @IsInt()
  producto_id: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}
