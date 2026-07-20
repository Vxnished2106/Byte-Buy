import { PartialType } from '@nestjs/mapped-types';
import { CreateEtiquetaDto } from './create-etiqueta.dto';

/**
 * DTO para la actualización de una etiqueta.
 * Todos los campos de {@link CreateEtiquetaDto} son opcionales.
 */
export class UpdateEtiquetaDto extends PartialType(CreateEtiquetaDto) {}
