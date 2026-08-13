import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PedidoService, ActorPedido } from './pedido.service';
import { Pedido, PedidoEstado } from './entities/pedido.entity';
import { PedidoHistorialEstado } from './entities/pedido_historial_estado.entity';
import { Usuario, Rol } from '../usuario/entities/usuario.entity';
import { Producto, ProductoEstado } from '../producto/entities/producto.entity';
import { DireccionEnvio } from '../direccion_envio/entities/direccion_envio.entity';
import { Inventario } from '../inventario/entities/inventario.entity';

/**
 * Pruebas unitarias del servicio de pedidos: una por cada invariante de negocio
 * (caso feliz y caso que falla), más el flujo crear→confirmar→cancelar y la
 * propagación de error que garantiza el rollback transaccional.
 *
 * Se mockean los repositorios, el `DataSource.transaction` y el EntityManager
 * transaccional para aislar la lógica. Los precios se devuelven como strings,
 * como los entrega MySQL para columnas `decimal`.
 */
describe('PedidoService', () => {
  let service: PedidoService;

  const CLIENTE_ID = 7;
  const ADMIN_ID = 1;
  const actorCliente: ActorPedido = {
    usuario_id: CLIENTE_ID,
    usuario_rol: Rol.CLIENTE,
  };
  const actorAdmin: ActorPedido = { usuario_id: ADMIN_ID, usuario_rol: Rol.ADMIN };

  // --- Mocks de repositorios y transacción -----------------------------------
  const pedidoRepo: any = {
    manager: { create: jest.fn((_e: any, obj: any) => obj) },
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const usuarioRepo = { findOneBy: jest.fn() };
  const productoRepo = { findBy: jest.fn() };
  const direccionRepo = { findOneBy: jest.fn() };

  let mockManager: any;
  const dataSource = {
    transaction: jest.fn(async (cb: any) => cb(mockManager)),
  };

  // --- Factories -------------------------------------------------------------
  const makeProducto = (over: Partial<any> = {}) => ({
    producto_id: 100,
    producto_precio: '100.00',
    producto_descuento: '0',
    producto_impuesto: '13',
    producto_estado: ProductoEstado.ACTIVO,
    ...over,
  });

  const makePedido = (over: Partial<Pedido> = {}): any => ({
    pedido_id: 1,
    pedido_numero: 'PED-000001',
    cliente_id: CLIENTE_ID,
    created_by: CLIENTE_ID,
    updated_by: CLIENTE_ID,
    direccion_envio_id: 10,
    pedido_fecha: new Date('2026-07-30T00:00:00Z'),
    pedido_notas: null,
    pedido_estado: PedidoEstado.BORRADOR,
    pedido_subtotal: '200.00',
    pedido_descuento_total: '0.00',
    pedido_impuesto_total: '26.00',
    pedido_total: '226.00',
    pedido_version: 0,
    created_at: new Date('2026-07-30T00:00:00Z'),
    updated_at: new Date('2026-07-30T00:00:00Z'),
    detalles: [
      {
        detalle_pedido_id: 1,
        producto_id: 100,
        detalle_pedido_cantidad: 2,
        detalle_pedido_precio_unitario: '100.00',
        detalle_pedido_descuento_pct: '0.00',
        detalle_pedido_impuesto_pct: '13.00',
        detalle_pedido_subtotal: '200.00',
        detalle_pedido_descuento_monto: '0.00',
        detalle_pedido_impuesto_monto: '26.00',
        detalle_pedido_total: '226.00',
      },
    ],
    historial: [],
    ...over,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    mockManager = {
      create: jest.fn((_e: any, obj: any) => obj),
      save: jest.fn(async (obj: any) => {
        if (obj && obj.pedido_numero && obj.pedido_id === undefined) {
          obj.pedido_id = 1;
        }
        return obj;
      }),
      count: jest.fn(async () => 0),
      delete: jest.fn(async () => ({ affected: 1 })),
      findOne: jest.fn(),
    };
    dataSource.transaction = jest.fn(async (cb: any) => cb(mockManager));

    // Por defecto, cliente y productos válidos; obtener() devuelve un pedido.
    usuarioRepo.findOneBy.mockResolvedValue({ usuario_id: CLIENTE_ID });
    productoRepo.findBy.mockResolvedValue([makeProducto()]);
    pedidoRepo.findOne.mockResolvedValue(makePedido());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        { provide: getRepositoryToken(Pedido), useValue: pedidoRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
        { provide: getRepositoryToken(Producto), useValue: productoRepo },
        { provide: getRepositoryToken(DireccionEnvio), useValue: direccionRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // CREAR
  // ==========================================================================
  describe('crear', () => {
    const dtoBase = {
      cliente_id: CLIENTE_ID,
      items: [{ producto_id: 100, cantidad: 2 }],
    };

    /** Captura el objeto Pedido que se pasó a manager.create(Pedido, ...). */
    const pedidoCreado = () => {
      const call = mockManager.create.mock.calls.find(
        ([entity]: any[]) => entity === Pedido,
      );
      return call?.[1];
    };

    it('calcula los importes desde el catálogo y crea el pedido en BORRADOR', async () => {
      await service.crear(dtoBase, actorCliente);

      const pedido = pedidoCreado();
      // 100 * 2 = 200 subtotal; 13% impuesto = 26; total 226.
      expect(pedido).toMatchObject({
        pedido_estado: PedidoEstado.BORRADOR,
        pedido_subtotal: 200,
        pedido_impuesto_total: 26,
        pedido_total: 226,
        created_by: CLIENTE_ID,
      });
      expect(pedido.detalles).toHaveLength(1);
      expect(pedido.detalles[0].detalle_pedido_total).toBe(226);
    });

    it('registra el historial de creación', async () => {
      await service.crear(dtoBase, actorCliente);
      const call = mockManager.create.mock.calls.find(
        ([entity]: any[]) => entity === PedidoHistorialEstado,
      );
      expect(call?.[1]).toMatchObject({
        estado_anterior: null,
        estado_nuevo: PedidoEstado.BORRADOR,
        usuario_id: CLIENTE_ID,
      });
    });

    it('usa siempre el precio del catálogo para la línea', async () => {
      await service.crear(dtoBase, actorCliente);
      expect(pedidoCreado().detalles[0].detalle_pedido_precio_unitario).toBe(100);
    });

    it('ignora cualquier precio_unitario que envíe el cliente (usa el del catálogo)', async () => {
      await service.crear(
        // El cliente no debería poder fijar el precio; se manda igual para
        // asegurar que el servidor lo descarta y toma el del catálogo (100).
        { cliente_id: CLIENTE_ID, items: [{ producto_id: 100, cantidad: 1, precio_unitario: 50 } as any] },
        actorCliente,
      );
      expect(pedidoCreado().detalles[0].detalle_pedido_precio_unitario).toBe(100);
    });

    it('INVARIANTE: rechaza si el cliente no existe', async () => {
      usuarioRepo.findOneBy.mockResolvedValue(null);
      await expect(service.crear(dtoBase, actorCliente)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('INVARIANTE: rechaza si no hay al menos una línea', async () => {
      await expect(
        service.crear({ cliente_id: CLIENTE_ID, items: [] }, actorCliente),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('INVARIANTE: rechaza líneas duplicadas del mismo producto', async () => {
      await expect(
        service.crear(
          {
            cliente_id: CLIENTE_ID,
            items: [
              { producto_id: 100, cantidad: 1 },
              { producto_id: 100, cantidad: 2 },
            ],
          },
          actorCliente,
        ),
      ).rejects.toThrow(/duplica el producto/);
    });

    it('INVARIANTE: rechaza si un producto no existe', async () => {
      productoRepo.findBy.mockResolvedValue([]);
      await expect(service.crear(dtoBase, actorCliente)).rejects.toThrow(
        /producto inexistente/,
      );
    });

    it('INVARIANTE: rechaza si un producto está inactivo', async () => {
      productoRepo.findBy.mockResolvedValue([
        makeProducto({ producto_estado: ProductoEstado.INACTIVO }),
      ]);
      await expect(service.crear(dtoBase, actorCliente)).rejects.toThrow(
        /producto inactivo/,
      );
    });

    it('INVARIANTE: rechaza si el descuento del catálogo queda fuera de 0–100', async () => {
      productoRepo.findBy.mockResolvedValue([
        makeProducto({ producto_descuento: '150' }),
      ]);
      await expect(service.crear(dtoBase, actorCliente)).rejects.toThrow(
        /descuento fuera del rango/,
      );
    });

    it('INVARIANTE: rechaza si la dirección no pertenece al cliente', async () => {
      direccionRepo.findOneBy.mockResolvedValue({
        direccion_envio_id: 10,
        usuario_id: 999,
      });
      await expect(
        service.crear({ ...dtoBase, direccion_envio_id: 10 }, actorCliente),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('IDEMPOTENCIA: con la misma clave devuelve el pedido existente sin crear otro', async () => {
      pedidoRepo.findOne.mockResolvedValue(makePedido({ pedido_id: 55 } as any));
      const result = await service.crear(dtoBase, actorCliente, 'key-abc');
      expect(result.pedido_id).toBe(55);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // CAMBIAR ESTADO (máquina de estados + stock)
  // ==========================================================================
  describe('cambiarEstado', () => {
    it('BORRADOR→CONFIRMADO con dirección y stock suficiente descuenta inventario', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue({
        producto_id: 100,
        inventario_stock_actual: 10,
      });

      await service.cambiarEstado(
        1,
        { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
        actorAdmin,
      );

      const invGuardado = mockManager.save.mock.calls
        .map((c: any[]) => c[0])
        .find((o: any) => o && 'inventario_stock_actual' in o);
      expect(invGuardado.inventario_stock_actual).toBe(8); // 10 - 2
    });

    it('INVARIANTE: no confirma sin dirección de envío', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ direccion_envio_id: null, pedido_version: 0 }),
      );
      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
          actorAdmin,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('INVARIANTE: rechaza confirmar con stock insuficiente (409) y no cambia el estado', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue({
        producto_id: 100,
        inventario_stock_actual: 1, // < 2 solicitados
      });

      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
          actorAdmin,
        ),
      ).rejects.toBeInstanceOf(ConflictException);

      // El pedido nunca se guardó con el nuevo estado (rollback de la operación).
      const guardoPedido = mockManager.save.mock.calls.some(
        (c: any[]) => c[0]?.pedido_estado === PedidoEstado.CONFIRMADO,
      );
      expect(guardoPedido).toBe(false);
    });

    it('permite confirmar productos sin inventario (no controlan stock)', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue(null); // sin registro de inventario

      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
          actorAdmin,
        ),
      ).resolves.toBeDefined();
    });

    it('INVARIANTE: rechaza una transición no permitida (ENTREGADO→BORRADOR)', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.ENTREGADO, pedido_version: 0 }),
      );
      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.BORRADOR, pedido_version: 0 },
          actorAdmin,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('CONCURRENCIA: rechaza si la versión no coincide (409)', async () => {
      pedidoRepo.findOne.mockResolvedValue(makePedido({ pedido_version: 3 }));
      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
          actorAdmin,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('PERMISOS: un usuario ajeno no admin no puede operar el pedido (403)', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ cliente_id: 999, created_by: 999, pedido_version: 0 }),
      );
      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
          actorCliente,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('CANCELADO desde BORRADOR no toca el inventario', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      await service.cambiarEstado(
        1,
        { nuevo_estado: PedidoEstado.CANCELADO, pedido_version: 0 },
        actorCliente,
      );
      expect(mockManager.findOne).not.toHaveBeenCalled(); // no consultó inventario
    });

    it('CANCELADO desde CONFIRMADO repone el inventario', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue({
        producto_id: 100,
        inventario_stock_actual: 8,
      });
      await service.cambiarEstado(
        1,
        { nuevo_estado: PedidoEstado.CANCELADO, pedido_version: 0 },
        actorAdmin,
      );
      const invGuardado = mockManager.save.mock.calls
        .map((c: any[]) => c[0])
        .find((o: any) => o && 'inventario_stock_actual' in o);
      expect(invGuardado.inventario_stock_actual).toBe(10); // 8 + 2
    });
  });

  // ==========================================================================
  // EDITAR
  // ==========================================================================
  describe('editar', () => {
    const dtoEdit = {
      pedido_version: 0,
      items: [{ producto_id: 100, cantidad: 3 }],
    };

    it('reemplaza las líneas y recalcula en un pedido BORRADOR', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      await service.editar(1, dtoEdit, actorCliente);
      expect(mockManager.delete).toHaveBeenCalled(); // borra líneas viejas
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('INVARIANTE: no permite editar un pedido que no está en BORRADOR (409)', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 }),
      );
      await expect(service.editar(1, dtoEdit, actorCliente)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('CONCURRENCIA: rechaza edición con versión desactualizada (409)', async () => {
      pedidoRepo.findOne.mockResolvedValue(makePedido({ pedido_version: 5 }));
      await expect(service.editar(1, dtoEdit, actorCliente)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('PERMISOS: un ajeno no admin no puede editar (403)', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ cliente_id: 999, created_by: 999, pedido_version: 0 }),
      );
      await expect(service.editar(1, dtoEdit, actorCliente)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ==========================================================================
  // OBTENER / LISTAR
  // ==========================================================================
  describe('obtener', () => {
    it('lanza 404 si el pedido no existe', async () => {
      pedidoRepo.findOne.mockResolvedValue(null);
      await expect(service.obtener(404)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listar', () => {
    it('aplica filtros, paginación y devuelve el envelope paginado', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[makePedido()], 25]),
      };
      pedidoRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.listar({
        estado: PedidoEstado.BORRADOR,
        cliente_id: CLIENTE_ID,
        buscar: 'PED',
        page: 2,
        limit: 10,
      });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'pedido.pedido_estado = :estado',
        { estado: PedidoEstado.BORRADOR },
      );
      expect(qb.skip).toHaveBeenCalledWith(10); // (2-1)*10
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result).toMatchObject({ total: 25, page: 2, limit: 10, total_paginas: 3 });
      expect(result.data).toHaveLength(1);
    });
  });

  // ==========================================================================
  // FLUJO INTEGRACIÓN (a nivel de servicio): crear → confirmar → cancelar
  // ==========================================================================
  describe('flujo crear→confirmar→cancelar', () => {
    it('descuenta stock al confirmar y lo repone al cancelar', async () => {
      // Crear
      await service.crear(
        { cliente_id: CLIENTE_ID, items: [{ producto_id: 100, cantidad: 2 }] },
        actorCliente,
        'flujo-1',
      );

      // Confirmar (descuenta 2 de 10 → 8)
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue({
        producto_id: 100,
        inventario_stock_actual: 10,
      });
      await service.cambiarEstado(
        1,
        { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
        actorAdmin,
      );
      const trasConfirmar = mockManager.save.mock.calls
        .map((c: any[]) => c[0])
        .find((o: any) => o && 'inventario_stock_actual' in o);
      expect(trasConfirmar.inventario_stock_actual).toBe(8);

      // Cancelar desde CONFIRMADO (repone 2 → 10)
      jest.clearAllMocks();
      dataSource.transaction = jest.fn(async (cb: any) => cb(mockManager));
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue({
        producto_id: 100,
        inventario_stock_actual: 8,
      });
      await service.cambiarEstado(
        1,
        { nuevo_estado: PedidoEstado.CANCELADO, pedido_version: 0 },
        actorAdmin,
      );
      const trasCancelar = mockManager.save.mock.calls
        .map((c: any[]) => c[0])
        .find((o: any) => o && 'inventario_stock_actual' in o);
      expect(trasCancelar.inventario_stock_actual).toBe(10);
    });
  });

  // ==========================================================================
  // ROLLBACK: un fallo a mitad de la transacción propaga el error
  // ==========================================================================
  describe('rollback transaccional', () => {
    it('si falla el guardado dentro de la transacción, el error se propaga y no se completa', async () => {
      pedidoRepo.findOne.mockResolvedValue(
        makePedido({ pedido_estado: PedidoEstado.BORRADOR, pedido_version: 0 }),
      );
      mockManager.findOne.mockResolvedValue({
        producto_id: 100,
        inventario_stock_actual: 10,
      });
      // Simula fallo de infraestructura al persistir dentro de la transacción.
      mockManager.save.mockRejectedValueOnce(new Error('fallo de BD'));

      await expect(
        service.cambiarEstado(
          1,
          { nuevo_estado: PedidoEstado.CONFIRMADO, pedido_version: 0 },
          actorAdmin,
        ),
      ).rejects.toThrow('fallo de BD');
    });
  });
});
