import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedorDto } from './create-proveedor.dto';

/**
 * DTO para la actualización de un proveedor.
 * Todos los campos de {@link CreateProveedorDto} son opcionales.
 */
export class UpdateProveedorDto extends PartialType(CreateProveedorDto) {}
