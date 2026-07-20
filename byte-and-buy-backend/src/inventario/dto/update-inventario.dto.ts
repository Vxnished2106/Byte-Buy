/**
 * DTO para la actualización de un inventario
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioDto } from './create-inventario.dto';

/**
 * DTO que contiene los datos necesarios para actualizar un inventario (todos los campos son opcionales)
 */
export class UpdateInventarioDto extends PartialType(CreateInventarioDto) {}