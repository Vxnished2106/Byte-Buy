/**
 * DTO para la actualización de una relación producto-proveedor
 */
import { PartialType } from '@nestjs/mapped-types';
import { AsignarProveedorDto } from './asignar-proveedor.dto';

/**
 * DTO que contiene los datos necesarios para actualizar una relación producto-proveedor (todos los campos son opcionales)
 */
export class UpdateProductoProveedorDto extends PartialType(AsignarProveedorDto) {}