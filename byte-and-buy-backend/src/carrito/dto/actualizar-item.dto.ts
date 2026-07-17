import { IsInt, Min } from 'class-validator';

export class ActualizarItemDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}
