import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatalogoService } from './catalogo.service';
import { Pais } from './entities/pais.entity';
import { Region } from './entities/region.entity';
import { Ciudad } from './entities/ciudad.entity';

/**
 * Pruebas unitarias del servicio de catálogos.
 * Verifican el mapeo a DTO, el orden alfabético y el filtrado opcional por
 * entidad padre (país → región, región → ciudad).
 */
describe('CatalogoService', () => {
  let service: CatalogoService;

  const paisRepo = { find: jest.fn() };
  const regionRepo = { find: jest.fn() };
  const ciudadRepo = { find: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogoService,
        { provide: getRepositoryToken(Pais), useValue: paisRepo },
        { provide: getRepositoryToken(Region), useValue: regionRepo },
        { provide: getRepositoryToken(Ciudad), useValue: ciudadRepo },
      ],
    }).compile();

    service = module.get<CatalogoService>(CatalogoService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findPaises', () => {
    it('devuelve los países mapeados a DTO y ordenados por nombre', async () => {
      paisRepo.find.mockResolvedValue([
        { pais_id: 1, pais_nombre: 'Costa Rica', pais_codigo: 'CR', regiones: [] },
      ]);

      const result = await service.findPaises();

      expect(paisRepo.find).toHaveBeenCalledWith({
        order: { pais_nombre: 'ASC' },
      });
      // El DTO no expone la relación `regiones`.
      expect(result).toEqual([
        { pais_id: 1, pais_nombre: 'Costa Rica', pais_codigo: 'CR' },
      ]);
    });
  });

  describe('findRegiones', () => {
    it('filtra por país cuando se pasa pais_id', async () => {
      regionRepo.find.mockResolvedValue([]);

      await service.findRegiones(3);

      expect(regionRepo.find).toHaveBeenCalledWith({
        where: { pais_id: 3 },
        order: { region_nombre: 'ASC' },
      });
    });

    it('no filtra (where vacío) cuando no se pasa pais_id', async () => {
      regionRepo.find.mockResolvedValue([]);

      await service.findRegiones();

      expect(regionRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { region_nombre: 'ASC' },
      });
    });

    it('mapea la región a DTO conservando el pais_id', async () => {
      regionRepo.find.mockResolvedValue([
        { region_id: 10, region_nombre: 'San José', pais_id: 3, ciudades: [] },
      ]);

      const result = await service.findRegiones(3);

      expect(result).toEqual([
        { region_id: 10, region_nombre: 'San José', pais_id: 3 },
      ]);
    });
  });

  describe('findCiudades', () => {
    it('filtra por región cuando se pasa region_id', async () => {
      ciudadRepo.find.mockResolvedValue([]);

      await service.findCiudades(10);

      expect(ciudadRepo.find).toHaveBeenCalledWith({
        where: { region_id: 10 },
        order: { ciudad_nombre: 'ASC' },
      });
    });

    it('no filtra (where vacío) cuando no se pasa region_id', async () => {
      ciudadRepo.find.mockResolvedValue([]);

      await service.findCiudades();

      expect(ciudadRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { ciudad_nombre: 'ASC' },
      });
    });

    it('mapea la ciudad a DTO conservando el region_id', async () => {
      ciudadRepo.find.mockResolvedValue([
        { ciudad_id: 100, ciudad_nombre: 'Escazú', region_id: 10 },
      ]);

      const result = await service.findCiudades(10);

      expect(result).toEqual([
        { ciudad_id: 100, ciudad_nombre: 'Escazú', region_id: 10 },
      ]);
    });
  });
});
