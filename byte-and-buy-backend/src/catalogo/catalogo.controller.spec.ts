import { Test, TestingModule } from '@nestjs/testing';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

/**
 * Pruebas unitarias del controlador de catálogos.
 * Verifican la delegación y el paso correcto de los filtros opcionales.
 */
describe('CatalogoController', () => {
  let controller: CatalogoController;

  const catalogoService = {
    findPaises: jest.fn(),
    findRegiones: jest.fn(),
    findCiudades: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogoController],
      providers: [{ provide: CatalogoService, useValue: catalogoService }],
    }).compile();

    controller = module.get<CatalogoController>(CatalogoController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('findPaises delega en el servicio', async () => {
    catalogoService.findPaises.mockResolvedValue([]);
    await controller.findPaises();
    expect(catalogoService.findPaises).toHaveBeenCalledTimes(1);
  });

  describe('findRegiones', () => {
    it('pasa el pais_id cuando viene como query param', async () => {
      catalogoService.findRegiones.mockResolvedValue([]);
      await controller.findRegiones(3);
      expect(catalogoService.findRegiones).toHaveBeenCalledWith(3);
    });

    it('pasa undefined cuando no viene pais_id', async () => {
      catalogoService.findRegiones.mockResolvedValue([]);
      await controller.findRegiones();
      expect(catalogoService.findRegiones).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findCiudades', () => {
    it('pasa el region_id cuando viene como query param', async () => {
      catalogoService.findCiudades.mockResolvedValue([]);
      await controller.findCiudades(10);
      expect(catalogoService.findCiudades).toHaveBeenCalledWith(10);
    });

    it('pasa undefined cuando no viene region_id', async () => {
      catalogoService.findCiudades.mockResolvedValue([]);
      await controller.findCiudades();
      expect(catalogoService.findCiudades).toHaveBeenCalledWith(undefined);
    });
  });
});
