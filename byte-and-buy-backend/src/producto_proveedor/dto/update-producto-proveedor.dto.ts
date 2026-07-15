import { PartialType } from '@nestjs/mapped-types';
import { AsignarProveedorDto } from './asignar-proveedor.dto';

export class UpdateProductoProveedorDto extends PartialType(AsignarProveedorDto) {}