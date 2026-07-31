import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DireccionEnvioService } from './direccion_envio.service';
import { DireccionEnvio } from './entities/direccion_envio.entity';
import { Ciudad } from '../catalogo/entities/ciudad.entity';
import { CreateDireccionEnvioDto } from './dto/create-direccion_envio.dto';

/**
 * Pruebas unitarias del servicio de direcciones de envío.
 * Verifican la validación de la ciudad, la asociación con el usuario y el
 * mapeo/orden de las direcciones del usuario.
 */
describe('DireccionEnvioService', () => {
  let service: DireccionEnvioService;

  const USUARIO_ID = 7;

  const direccionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
  const ciudadRepo = {
    findOneBy: jest.fn(),
  };

  const dto: CreateDireccionEnvioDto = {
    ciudad_id: 5,
    direccion_destinatario: 'Ana Pérez',
    direccion_telefono: '8888-8888',
    direccion_calle: 'Av. Central 100',
    direccion_referencia: 'Casa azul',
    direccion_codigo_postal: '10101',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    direccionRepo.create.mockImplementation((obj) => obj);
    direccionRepo.save.mockImplementation(async (d) => ({
      direccion_envio_id: 1,
      direccion_fecha_creacion: new Date('2026-07-30T00:00:00Z'),
      direccion_referencia: null,
      direccion_codigo_postal: null,
      ...d,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DireccionEnvioService,
        { provide: getRepositoryToken(DireccionEnvio), useValue: direccionRepo },
        { provide: getRepositoryToken(Ciudad), useValue: ciudadRepo },
      ],
    }).compile();

    service = module.get<DireccionEnvioService>(DireccionEnvioService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('registra la dirección asociándola al usuario cuando la ciudad existe', async () => {
      ciudadRepo.findOneBy.mockResolvedValue({ ciudad_id: 5 });

      const result = await service.create({ ...dto, usuario_id: USUARIO_ID });

      expect(ciudadRepo.findOneBy).toHaveBeenCalledWith({ ciudad_id: 5 });
      expect(direccionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: USUARIO_ID, ciudad_id: 5 }),
      );
      expect(result).toMatchObject({
        direccion_envio_id: 1,
        usuario_id: USUARIO_ID,
        ciudad_id: 5,
        direccion_destinatario: 'Ana Pérez',
      });
    });

    it('lanza NotFoundException si la ciudad no existe y no persiste nada', async () => {
      ciudadRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ ...dto, usuario_id: USUARIO_ID }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(direccionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findByUsuario', () => {
    it('devuelve las direcciones del usuario ordenadas por fecha descendente', async () => {
      direccionRepo.find.mockResolvedValue([
        {
          direccion_envio_id: 2,
          usuario_id: USUARIO_ID,
          ciudad_id: 5,
          direccion_destinatario: 'Ana Pérez',
          direccion_telefono: '8888-8888',
          direccion_calle: 'Calle 2',
          direccion_referencia: null,
          direccion_codigo_postal: null,
          direccion_fecha_creacion: new Date(),
        },
      ]);

      const result = await service.findByUsuario(USUARIO_ID);

      expect(direccionRepo.find).toHaveBeenCalledWith({
        where: { usuario_id: USUARIO_ID },
        order: { direccion_fecha_creacion: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].direccion_envio_id).toBe(2);
    });

    it('devuelve un arreglo vacío si el usuario no tiene direcciones', async () => {
      direccionRepo.find.mockResolvedValue([]);

      const result = await service.findByUsuario(USUARIO_ID);

      expect(result).toEqual([]);
    });
  });
});
