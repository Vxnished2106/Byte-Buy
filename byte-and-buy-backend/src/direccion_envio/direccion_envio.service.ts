import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionEnvio } from './entities/direccion_envio.entity';
import { Ciudad } from '../catalogo/entities/ciudad.entity';
import { CreateDireccionEnvioDto } from './dto/create-direccion_envio.dto';
import { ResponseDireccionEnvioDto } from './dto/response-direccion_envio.dto';

/**
 * Servicio de direcciones de envío.
 * Contiene la lógica para registrar y consultar las direcciones de los usuarios.
 */
@Injectable()
export class DireccionEnvioService {
  constructor(
    @InjectRepository(DireccionEnvio)
    private readonly direccionRepository: Repository<DireccionEnvio>,
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) {}

  /**
   * Convierte una entidad DireccionEnvio a su DTO de respuesta.
   * @param direccion Entidad DireccionEnvio.
   * @returns DTO de respuesta.
   */
  private toResponseDto(direccion: DireccionEnvio): ResponseDireccionEnvioDto {
    return {
      direccion_envio_id: direccion.direccion_envio_id,
      usuario_id: direccion.usuario_id,
      ciudad_id: direccion.ciudad_id,
      direccion_destinatario: direccion.direccion_destinatario,
      direccion_telefono: direccion.direccion_telefono,
      direccion_calle: direccion.direccion_calle,
      direccion_referencia: direccion.direccion_referencia,
      direccion_codigo_postal: direccion.direccion_codigo_postal,
      direccion_fecha_creacion: direccion.direccion_fecha_creacion,
    };
  }

  /**
   * Registra una nueva dirección de envío para un usuario.
   * @param datos Datos de la dirección, incluyendo el ID del usuario.
   * @returns Dirección registrada.
   * @throws NotFoundException Si la ciudad no existe.
   */
  async create(
    datos: CreateDireccionEnvioDto & { usuario_id: number },
  ): Promise<ResponseDireccionEnvioDto> {
    const ciudad = await this.ciudadRepository.findOneBy({
      ciudad_id: datos.ciudad_id,
    });
    if (!ciudad) throw new NotFoundException('Ciudad no encontrada');

    const direccion = this.direccionRepository.create(datos);
    const guardada = await this.direccionRepository.save(direccion);
    return this.toResponseDto(guardada);
  }

  /**
   * Obtiene todas las direcciones de envío de un usuario.
   * @param usuario_id ID del usuario.
   * @returns Lista de direcciones del usuario.
   */
  async findByUsuario(
    usuario_id: number,
  ): Promise<ResponseDireccionEnvioDto[]> {
    const direcciones = await this.direccionRepository.find({
      where: { usuario_id },
      order: { direccion_fecha_creacion: 'DESC' },
    });
    return direcciones.map((d) => this.toResponseDto(d));
  }
}
