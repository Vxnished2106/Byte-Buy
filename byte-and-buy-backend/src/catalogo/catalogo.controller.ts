import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import {
  ResponsePaisDto,
  ResponseRegionDto,
  ResponseCiudadDto,
} from './dto/response-catalogo.dto';

/**
 * Controlador de catálogos geográficos.
 * Expone los países, regiones y ciudades usados en las direcciones de envío.
 * Son datos de referencia públicos, por lo que no requieren autenticación.
 */
@Controller('catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  /**
   * Lista todos los países disponibles.
   * @returns Lista de países.
   */
  @Get('paises')
  findPaises(): Promise<ResponsePaisDto[]> {
    return this.catalogoService.findPaises();
  }

  /**
   * Lista las regiones, opcionalmente filtradas por país.
   * @param pais_id ID del país por el cual filtrar (query param opcional).
   * @returns Lista de regiones.
   */
  @Get('regiones')
  findRegiones(
    @Query('pais_id', new ParseIntPipe({ optional: true })) pais_id?: number,
  ): Promise<ResponseRegionDto[]> {
    return this.catalogoService.findRegiones(pais_id);
  }

  /**
   * Lista las ciudades, opcionalmente filtradas por región.
   * @param region_id ID de la región por la cual filtrar (query param opcional).
   * @returns Lista de ciudades.
   */
  @Get('ciudades')
  findCiudades(
    @Query('region_id', new ParseIntPipe({ optional: true }))
    region_id?: number,
  ): Promise<ResponseCiudadDto[]> {
    return this.catalogoService.findCiudades(region_id);
  }
}
