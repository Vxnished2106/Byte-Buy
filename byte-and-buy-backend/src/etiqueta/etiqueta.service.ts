import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Etiqueta } from './entities/etiqueta.entity';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';
import { ResponseEtiquetaDto } from './dto/response-etiqueta.dto';

@Injectable()
export class EtiquetaService {
  constructor(
    @InjectRepository(Etiqueta)
    private readonly etiquetaRepository: Repository<Etiqueta>,
  ) {}

  private toResponseDto(etiqueta: Etiqueta): ResponseEtiquetaDto {
    return {
      etiqueta_id: etiqueta.etiqueta_id,
      etiqueta_nombre: etiqueta.etiqueta_nombre,
    };
  }

  /**
   * Mostrar todas las etiquetas
   */
  async mostrarEtiquetas(): Promise<ResponseEtiquetaDto[]> {
    const etiquetas = await this.etiquetaRepository.find({
      order: {
        etiqueta_nombre: 'ASC',
      },
    });

    return etiquetas.map((etiqueta) => this.toResponseDto(etiqueta));
  }

  /**
   * Registrar etiqueta
   */
  async registrarEtiqueta(
    datos: CreateEtiquetaDto,
  ): Promise<ResponseEtiquetaDto> {
    const existe = await this.etiquetaRepository.findOne({
      where: {
        etiqueta_nombre: datos.etiqueta_nombre,
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe una etiqueta con ese nombre',
      );
    }

    const etiqueta = this.etiquetaRepository.create(datos);

    const guardado = await this.etiquetaRepository.save(etiqueta);

    return this.toResponseDto(guardado);
  }

  /**
   * Editar etiqueta
   */
  async editarEtiqueta(
    etiqueta_id: number,
    datos: UpdateEtiquetaDto,
  ): Promise<ResponseEtiquetaDto> {
    const etiqueta = await this.etiquetaRepository.findOne({
      where: {
        etiqueta_id,
      },
    });

    if (!etiqueta) {
      throw new NotFoundException(
        'Etiqueta no encontrada',
      );
    }

    if (
      datos.etiqueta_nombre &&
      datos.etiqueta_nombre !== etiqueta.etiqueta_nombre
    ) {
      const existe = await this.etiquetaRepository.findOne({
        where: {
          etiqueta_nombre: datos.etiqueta_nombre,
        },
      });

      if (existe) {
        throw new BadRequestException(
          'Ya existe una etiqueta con ese nombre',
        );
      }
    }

    Object.assign(etiqueta, datos);

    const guardado = await this.etiquetaRepository.save(etiqueta);

    return this.toResponseDto(guardado);
  }

  /**
   * Obtener una etiqueta
   */
  async obtenerEtiqueta(
    etiqueta_id: number,
  ): Promise<ResponseEtiquetaDto> {
    const etiqueta = await this.etiquetaRepository.findOne({
      where: {
        etiqueta_id,
      },
    });

    if (!etiqueta) {
      throw new NotFoundException(
        'Etiqueta no encontrada',
      );
    }

    return this.toResponseDto(etiqueta);
  }

  /**
   * Obtener la entidad
   */
  async findEntity(
    etiqueta_id: number,
  ): Promise<Etiqueta> {
    const etiqueta = await this.etiquetaRepository.findOne({
      where: {
        etiqueta_id,
      },
    });

    if (!etiqueta) {
      throw new NotFoundException(
        'Etiqueta no encontrada',
      );
    }

    return etiqueta;
  }
}