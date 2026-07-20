import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

/**
 * DTO para la actualización de una categoría.
 */
export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}