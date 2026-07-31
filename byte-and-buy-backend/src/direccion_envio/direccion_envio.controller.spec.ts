import { Test, TestingModule } from '@nestjs/testing';
import { DireccionEnvioController } from './direccion_envio.controller';
import { DireccionEnvioService } from './direccion_envio.service';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateDireccionEnvioDto } from './dto/create-direccion_envio.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Pruebas unitarias del controlador de direcciones de envío.
 * Verifican la resolución del usuario autenticado y la delegación en el servicio.
 */
describe('DireccionEnvioController', () => {
  let controller: DireccionEnvioController;

  const USUARIO_ID = 7;
  const tokenUser = { sub: 'supabase-uid-abc' };
  const req = { user: tokenUser };

  const direccionEnvioService = {
    create: jest.fn(),
    findByUsuario: jest.fn(),
  };
  const usuarioService = {
    getOrCreateFromToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    usuarioService.getOrCreateFromToken.mockResolvedValue({
      usuario_id: USUARIO_ID,
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DireccionEnvioController],
      providers: [
        { provide: DireccionEnvioService, useValue: direccionEnvioService },
        { provide: UsuarioService, useValue: usuarioService },
      ],
    })
      // El guard real depende de ConfigService/jose; no aporta a estas pruebas.
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DireccionEnvioController>(DireccionEnvioController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('resuelve el usuario del token y delega inyectando el usuario_id', async () => {
      const dto: CreateDireccionEnvioDto = {
        ciudad_id: 5,
        direccion_destinatario: 'Ana Pérez',
        direccion_telefono: '8888-8888',
        direccion_calle: 'Av. Central 100',
      };
      const esperado = { direccion_envio_id: 1 };
      direccionEnvioService.create.mockResolvedValue(esperado);

      const result = await controller.create(req, dto);

      expect(usuarioService.getOrCreateFromToken).toHaveBeenCalledWith(
        tokenUser,
      );
      expect(direccionEnvioService.create).toHaveBeenCalledWith({
        ...dto,
        usuario_id: USUARIO_ID,
      });
      expect(result).toBe(esperado);
    });
  });

  describe('findMisDirecciones', () => {
    it('lista solo las direcciones del usuario autenticado', async () => {
      direccionEnvioService.findByUsuario.mockResolvedValue([]);

      await controller.findMisDirecciones(req);

      expect(direccionEnvioService.findByUsuario).toHaveBeenCalledWith(
        USUARIO_ID,
      );
    });
  });
});
