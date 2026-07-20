/**
 * DTO para la actualización de un producto
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';

/**
 * DTO que contiene los datos necesarios para actualizar un producto (todos los campos son opcionales)
 */
export class UpdateProductoDto extends PartialType(CreateProductoDto) {}