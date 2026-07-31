import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pais } from './entities/pais.entity';
import { Region } from './entities/region.entity';
import { Ciudad } from './entities/ciudad.entity';
import {
  ResponsePaisDto,
  ResponseRegionDto,
  ResponseCiudadDto,
} from './dto/response-catalogo.dto';

/**
 * Servicio de catálogos geográficos.
 * Provee la consulta de países, regiones y ciudades para las direcciones de envío.
 */
@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Pais)
    private readonly paisRepository: Repository<Pais>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) {}

  /**
   * Obtiene todos los países del catálogo.
   * @returns Lista de países ordenada por nombre.
   */
  async findPaises(): Promise<ResponsePaisDto[]> {
    const paises = await this.paisRepository.find({
      order: { pais_nombre: 'ASC' },
    });
    return paises.map((p) => ({
      pais_id: p.pais_id,
      pais_nombre: p.pais_nombre,
      pais_codigo: p.pais_codigo,
    }));
  }

  /**
   * Obtiene las regiones del catálogo, opcionalmente filtradas por país.
   * @param pais_id ID del país por el cual filtrar (opcional).
   * @returns Lista de regiones ordenada por nombre.
   */
  async findRegiones(pais_id?: number): Promise<ResponseRegionDto[]> {
    const regiones = await this.regionRepository.find({
      where: pais_id ? { pais_id } : {},
      order: { region_nombre: 'ASC' },
    });
    return regiones.map((r) => ({
      region_id: r.region_id,
      region_nombre: r.region_nombre,
      pais_id: r.pais_id,
    }));
  }

  /**
   * Obtiene las ciudades del catálogo, opcionalmente filtradas por región.
   * @param region_id ID de la región por la cual filtrar (opcional).
   * @returns Lista de ciudades ordenada por nombre.
   */
  async findCiudades(region_id?: number): Promise<ResponseCiudadDto[]> {
    const ciudades = await this.ciudadRepository.find({
      where: region_id ? { region_id } : {},
      order: { ciudad_nombre: 'ASC' },
    });
    return ciudades.map((c) => ({
      ciudad_id: c.ciudad_id,
      ciudad_nombre: c.ciudad_nombre,
      region_id: c.region_id,
    }));
  }
}
