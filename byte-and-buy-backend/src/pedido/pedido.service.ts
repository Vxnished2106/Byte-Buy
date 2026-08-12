import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  Pedido,
  PedidoEstado,
  TRANSICIONES_PEDIDO,
} from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle_pedido.entity';
import { PedidoHistorialEstado } from './entities/pedido_historial_estado.entity';
import { Usuario, Rol } from '../usuario/entities/usuario.entity';
import {
  Producto,
  ProductoEstado,
} from '../producto/entities/producto.entity';
import { DireccionEnvio } from '../direccion_envio/entities/direccion_envio.entity';
import { Inventario } from '../inventario/entities/inventario.entity';
import { CreatePedidoDto, PedidoItemDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { ListarPedidosDto } from './dto/listar-pedidos.dto';
import {
  ResponsePedidoDto,
  ResponsePedidoPaginadoDto,
} from './dto/response-pedido.dto';

/** Identidad mínima del usuario que ejecuta la acción (para permisos/auditoría). */
export interface ActorPedido {
  usuario_id: number;
  usuario_rol: Rol;
}

/** Resultado del cálculo de líneas: detalles listos para persistir + totales. */
interface CalculoPedido {
  detalles: DetallePedido[];
  pedido_subtotal: number;
  pedido_descuento_total: number;
  pedido_impuesto_total: number;
  pedido_total: number;
}

/**
 * Servicio de pedidos.
 *
 * Concentra TODAS las invariantes de negocio (el controlador y el frontend no
 * validan reglas, solo forma). Principios:
 * - El servidor recalcula siempre los importes; nunca confía en los totales del
 *   cliente.
 * - Cabecera, líneas, historial y movimientos de inventario se persisten en una
 *   sola transacción: si algo falla, no se guarda nada.
 * - Concurrencia optimista por versión; idempotencia en la creación.
 */
@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(DireccionEnvio)
    private readonly direccionRepository: Repository<DireccionEnvio>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------------------
  // Helpers de cálculo
  // ---------------------------------------------------------------------------

  /** Redondeo monetario a 2 decimales (evita el sesgo binario de coma flotante). */
  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  /**
   * Valida las líneas y calcula sus importes y los totales del pedido.
   *
   * Invariantes cubiertas: al menos una línea, sin productos duplicados,
   * producto existente y activo, cantidad entera > 0 (forma en el DTO), precio
   * no negativo y descuento en rango. Los importes salen SIEMPRE del catálogo,
   * no del cliente.
   *
   * @throws BadRequestException Forma/negocio de línea inválida (con índice).
   */
  private async calcularLineas(items: PedidoItemDto[]): Promise<CalculoPedido> {
    if (items.length === 0) {
      throw new BadRequestException('El pedido debe tener al menos una línea');
    }

    // Rechazo de productos duplicados (decisión documentada: no se consolidan).
    const vistos = new Set<number>();
    items.forEach((item, idx) => {
      if (vistos.has(item.producto_id)) {
        throw new BadRequestException(
          `La línea ${idx} duplica el producto ${item.producto_id}; ` +
            `un producto no puede repetirse en el pedido`,
        );
      }
      vistos.add(item.producto_id);
    });

    const productos = await this.productoRepository.findBy({
      producto_id: In(items.map((i) => i.producto_id)),
    });
    const porId = new Map(productos.map((p) => [p.producto_id, p]));

    let subtotalTotal = 0;
    let descuentoTotal = 0;
    let impuestoTotal = 0;
    let total = 0;

    const detalles = items.map((item, idx) => {
      const producto = porId.get(item.producto_id);
      if (!producto) {
        throw new BadRequestException(
          `La línea ${idx} referencia un producto inexistente (${item.producto_id})`,
        );
      }
      if (producto.producto_estado !== ProductoEstado.ACTIVO) {
        throw new BadRequestException(
          `La línea ${idx} referencia un producto inactivo (${item.producto_id})`,
        );
      }

      const precio = this.redondear(
        item.precio_unitario ?? Number(producto.producto_precio),
      );
      const descuentoPct = item.descuento_pct ?? Number(producto.producto_descuento);
      const impuestoPct = Number(producto.producto_impuesto);

      if (precio < 0) {
        throw new BadRequestException(
          `La línea ${idx} tiene un precio unitario negativo`,
        );
      }
      if (descuentoPct < 0 || descuentoPct > 100) {
        throw new BadRequestException(
          `La línea ${idx} tiene un descuento fuera del rango 0–100`,
        );
      }

      const subtotal = this.redondear(precio * item.cantidad);
      const descuentoMonto = this.redondear((subtotal * descuentoPct) / 100);
      const base = subtotal - descuentoMonto;
      const impuestoMonto = this.redondear((base * impuestoPct) / 100);
      const totalLinea = this.redondear(base + impuestoMonto);

      subtotalTotal += subtotal;
      descuentoTotal += descuentoMonto;
      impuestoTotal += impuestoMonto;
      total += totalLinea;

      return this.pedidoRepository.manager.create(DetallePedido, {
        producto_id: item.producto_id,
        detalle_pedido_cantidad: item.cantidad,
        detalle_pedido_precio_unitario: precio,
        detalle_pedido_descuento_pct: descuentoPct,
        detalle_pedido_impuesto_pct: impuestoPct,
        detalle_pedido_subtotal: subtotal,
        detalle_pedido_descuento_monto: descuentoMonto,
        detalle_pedido_impuesto_monto: impuestoMonto,
        detalle_pedido_total: totalLinea,
      });
    });

    return {
      detalles,
      pedido_subtotal: this.redondear(subtotalTotal),
      pedido_descuento_total: this.redondear(descuentoTotal),
      pedido_impuesto_total: this.redondear(impuestoTotal),
      pedido_total: this.redondear(total),
    };
  }

  /** Genera el siguiente número de pedido legible dentro de la transacción. */
  private async generarNumero(manager: EntityManager): Promise<string> {
    const count = await manager.count(Pedido);
    return `PED-${String(count + 1).padStart(6, '0')}`;
  }

  // ---------------------------------------------------------------------------
  // Mapeo a DTO
  // ---------------------------------------------------------------------------

  private toResponseDto(pedido: Pedido): ResponsePedidoDto {
    return {
      pedido_id: pedido.pedido_id,
      pedido_numero: pedido.pedido_numero,
      cliente_id: pedido.cliente_id,
      direccion_envio_id: pedido.direccion_envio_id,
      pedido_fecha: pedido.pedido_fecha,
      pedido_notas: pedido.pedido_notas,
      pedido_estado: pedido.pedido_estado,
      pedido_subtotal: Number(pedido.pedido_subtotal),
      pedido_descuento_total: Number(pedido.pedido_descuento_total),
      pedido_impuesto_total: Number(pedido.pedido_impuesto_total),
      pedido_total: Number(pedido.pedido_total),
      pedido_version: pedido.pedido_version,
      created_by: pedido.created_by,
      updated_by: pedido.updated_by,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at,
      detalles: (pedido.detalles ?? []).map((d) => ({
        detalle_pedido_id: d.detalle_pedido_id,
        producto_id: d.producto_id,
        producto_nombre: d.producto?.producto_nombre,
        detalle_pedido_cantidad: d.detalle_pedido_cantidad,
        detalle_pedido_precio_unitario: Number(d.detalle_pedido_precio_unitario),
        detalle_pedido_descuento_pct: Number(d.detalle_pedido_descuento_pct),
        detalle_pedido_impuesto_pct: Number(d.detalle_pedido_impuesto_pct),
        detalle_pedido_subtotal: Number(d.detalle_pedido_subtotal),
        detalle_pedido_descuento_monto: Number(d.detalle_pedido_descuento_monto),
        detalle_pedido_impuesto_monto: Number(d.detalle_pedido_impuesto_monto),
        detalle_pedido_total: Number(d.detalle_pedido_total),
      })),
      historial: pedido.historial
        ? pedido.historial
            .slice()
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
            .map((h) => ({
              historial_id: h.historial_id,
              estado_anterior: h.estado_anterior,
              estado_nuevo: h.estado_nuevo,
              usuario_id: h.usuario_id,
              historial_nota: h.historial_nota,
              created_at: h.created_at,
            }))
        : undefined,
    };
  }

  // ---------------------------------------------------------------------------
  // Comandos
  // ---------------------------------------------------------------------------

  /**
   * Crea un pedido en estado BORRADOR (no toca inventario todavía).
   *
   * Idempotente: si se repite `idempotencyKey` se devuelve el pedido ya creado.
   *
   * @throws NotFoundException Cliente o dirección inexistentes.
   * @throws ForbiddenException La dirección no pertenece al cliente.
   * @throws BadRequestException Líneas inválidas.
   */
  async crear(
    dto: CreatePedidoDto,
    actor: ActorPedido,
    idempotencyKey?: string,
  ): Promise<ResponsePedidoDto> {
    if (idempotencyKey) {
      const existente = await this.pedidoRepository.findOne({
        where: { pedido_idempotency_key: idempotencyKey },
        relations: { detalles: { producto: true }, historial: true },
      });
      if (existente) return this.toResponseDto(existente);
    }

    const cliente = await this.usuarioRepository.findOneBy({
      usuario_id: dto.cliente_id,
    });
    if (!cliente) throw new NotFoundException('El cliente no existe');

    if (dto.direccion_envio_id !== undefined) {
      await this.validarDireccion(dto.direccion_envio_id, dto.cliente_id);
    }

    const calculo = await this.calcularLineas(dto.items);

    try {
      const pedidoId = await this.dataSource.transaction(async (manager) => {
        const numero = await this.generarNumero(manager);
        const pedido = manager.create(Pedido, {
          pedido_numero: numero,
          cliente_id: dto.cliente_id,
          direccion_envio_id: dto.direccion_envio_id ?? null,
          pedido_fecha: dto.pedido_fecha ? new Date(dto.pedido_fecha) : new Date(),
          pedido_notas: dto.pedido_notas ?? null,
          pedido_estado: PedidoEstado.BORRADOR,
          pedido_subtotal: calculo.pedido_subtotal,
          pedido_descuento_total: calculo.pedido_descuento_total,
          pedido_impuesto_total: calculo.pedido_impuesto_total,
          pedido_total: calculo.pedido_total,
          pedido_idempotency_key: idempotencyKey ?? null,
          created_by: actor.usuario_id,
          updated_by: actor.usuario_id,
          detalles: calculo.detalles,
        });
        const guardado = await manager.save(pedido);

        await manager.save(
          manager.create(PedidoHistorialEstado, {
            pedido_id: guardado.pedido_id,
            estado_anterior: null,
            estado_nuevo: PedidoEstado.BORRADOR,
            usuario_id: actor.usuario_id,
            historial_nota: 'Pedido creado',
          }),
        );

        return guardado.pedido_id;
      });

      return this.obtener(pedidoId);
    } catch (err) {
      // Carrera con la misma clave de idempotencia: devolvemos el pedido creado
      // por la otra petición en vez de propagar el error de unicidad.
      if (idempotencyKey && this.esViolacionUnicidad(err)) {
        const existente = await this.pedidoRepository.findOne({
          where: { pedido_idempotency_key: idempotencyKey },
          relations: { detalles: { producto: true }, historial: true },
        });
        if (existente) return this.toResponseDto(existente);
      }
      throw err;
    }
  }

  /**
   * Edita la cabecera y las líneas de un pedido en BORRADOR.
   *
   * @throws NotFoundException El pedido no existe.
   * @throws ForbiddenException Sin permiso sobre el pedido.
   * @throws ConflictException Versión desactualizada o pedido no editable.
   * @throws BadRequestException Líneas inválidas.
   */
  async editar(
    id: number,
    dto: UpdatePedidoDto,
    actor: ActorPedido,
  ): Promise<ResponsePedidoDto> {
    const pedido = await this.cargarEntidad(id);
    this.verificarPermiso(pedido, actor);
    this.verificarVersion(pedido, dto.pedido_version);

    if (pedido.pedido_estado !== PedidoEstado.BORRADOR) {
      throw new ConflictException(
        'Solo se pueden editar las líneas de un pedido en BORRADOR',
      );
    }

    if (dto.direccion_envio_id !== undefined) {
      await this.validarDireccion(dto.direccion_envio_id, pedido.cliente_id);
    }

    const calculo = await this.calcularLineas(dto.items);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(DetallePedido, { pedido_id: id });

      pedido.pedido_fecha = dto.pedido_fecha
        ? new Date(dto.pedido_fecha)
        : pedido.pedido_fecha;
      pedido.pedido_notas = dto.pedido_notas ?? pedido.pedido_notas;
      if (dto.direccion_envio_id !== undefined) {
        pedido.direccion_envio_id = dto.direccion_envio_id;
      }
      pedido.pedido_subtotal = calculo.pedido_subtotal;
      pedido.pedido_descuento_total = calculo.pedido_descuento_total;
      pedido.pedido_impuesto_total = calculo.pedido_impuesto_total;
      pedido.pedido_total = calculo.pedido_total;
      pedido.updated_by = actor.usuario_id;
      pedido.detalles = calculo.detalles.map((d) => {
        d.pedido_id = id;
        return d;
      });

      await manager.save(pedido);
    });

    return this.obtener(id);
  }

  /**
   * Ejecuta una transición de estado con sus efectos sobre el inventario.
   *
   * - → CONFIRMADO: exige dirección de envío y descuenta stock (transaccional).
   * - → CANCELADO desde CONFIRMADO/EN_PREPARACION: repone stock.
   *
   * @throws NotFoundException El pedido no existe.
   * @throws ForbiddenException Sin permiso sobre el pedido.
   * @throws ConflictException Versión desactualizada, transición inválida o
   *         stock insuficiente.
   */
  async cambiarEstado(
    id: number,
    dto: CambiarEstadoPedidoDto,
    actor: ActorPedido,
  ): Promise<ResponsePedidoDto> {
    const pedido = await this.cargarEntidad(id);
    this.verificarPermiso(pedido, actor);
    this.verificarVersion(pedido, dto.pedido_version);

    const permitidas = TRANSICIONES_PEDIDO[pedido.pedido_estado];
    if (!permitidas.includes(dto.nuevo_estado)) {
      throw new ConflictException(
        `Transición no permitida: ${pedido.pedido_estado} → ${dto.nuevo_estado}`,
      );
    }

    const estadoAnterior = pedido.pedido_estado;

    if (dto.nuevo_estado === PedidoEstado.CONFIRMADO) {
      if (!pedido.direccion_envio_id) {
        throw new BadRequestException(
          'El pedido necesita una dirección de envío para ser confirmado',
        );
      }
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.nuevo_estado === PedidoEstado.CONFIRMADO) {
        await this.descontarStock(manager, pedido);
      } else if (
        dto.nuevo_estado === PedidoEstado.CANCELADO &&
        (estadoAnterior === PedidoEstado.CONFIRMADO ||
          estadoAnterior === PedidoEstado.EN_PREPARACION)
      ) {
        await this.reponerStock(manager, pedido);
      }

      pedido.pedido_estado = dto.nuevo_estado;
      pedido.updated_by = actor.usuario_id;
      await manager.save(pedido);

      await manager.save(
        manager.create(PedidoHistorialEstado, {
          pedido_id: id,
          estado_anterior: estadoAnterior,
          estado_nuevo: dto.nuevo_estado,
          usuario_id: actor.usuario_id,
          historial_nota: dto.nota ?? null,
        }),
      );
    });

    return this.obtener(id);
  }

  /**
   * Alinea el estado de un pedido BORRADOR con un pago ya completado fuera de
   * este módulo (el checkout de `venta`/`pago`/`detalle_compra` descuenta el
   * stock directamente, sin pasar por `cambiarEstado`). Deja el pedido en
   * CONFIRMADO SIN volver a descontar stock (ya se descontó al pagar); así,
   * si el pedido se cancela después, `cambiarEstado` sabe que debe reponerlo.
   *
   * A diferencia de `cambiarEstado`, no exige versión ni dirección de envío:
   * es un ajuste de estado interno posterior a una venta ya realizada, no una
   * transición elegida por el usuario. Es idempotente: si el pedido ya no
   * está en BORRADOR (ej. reintento de red), no hace nada y devuelve su
   * estado actual.
   *
   * @throws NotFoundException El pedido no existe.
   * @throws ForbiddenException Sin permiso sobre el pedido.
   */
  async confirmarPorPago(
    id: number,
    actor: ActorPedido,
  ): Promise<ResponsePedidoDto> {
    const pedido = await this.cargarEntidad(id);
    this.verificarPermiso(pedido, actor);

    if (pedido.pedido_estado !== PedidoEstado.BORRADOR) {
      return this.obtener(id);
    }

    await this.dataSource.transaction(async (manager) => {
      pedido.pedido_estado = PedidoEstado.CONFIRMADO;
      pedido.updated_by = actor.usuario_id;
      await manager.save(pedido);

      await manager.save(
        manager.create(PedidoHistorialEstado, {
          pedido_id: id,
          estado_anterior: PedidoEstado.BORRADOR,
          estado_nuevo: PedidoEstado.CONFIRMADO,
          usuario_id: actor.usuario_id,
          historial_nota:
            'Confirmado automáticamente: el pago ya se procesó y el stock se descontó al pagar.',
        }),
      );
    });

    return this.obtener(id);
  }

  // ---------------------------------------------------------------------------
  // Consultas
  // ---------------------------------------------------------------------------

  /** Obtiene un pedido con sus líneas e historial. */
  async obtener(id: number): Promise<ResponsePedidoDto> {
    const pedido = await this.pedidoRepository.findOne({
      where: { pedido_id: id },
      relations: { detalles: { producto: true }, historial: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return this.toResponseDto(pedido);
  }

  /**
   * Lista pedidos con filtros, búsqueda, orden y paginación resueltos en SQL.
   */
  async listar(query: ListarPedidosDto): Promise<ResponsePedidoPaginadoDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const ordenPor = query.orden_por ?? 'created_at';
    const ordenDir = query.orden_dir ?? 'DESC';

    const qb = this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.detalles', 'detalle');

    if (query.estado) {
      qb.andWhere('pedido.pedido_estado = :estado', { estado: query.estado });
    }
    if (query.cliente_id !== undefined) {
      qb.andWhere('pedido.cliente_id = :cliente', { cliente: query.cliente_id });
    }
    if (query.fecha_desde) {
      qb.andWhere('pedido.pedido_fecha >= :desde', { desde: query.fecha_desde });
    }
    if (query.fecha_hasta) {
      qb.andWhere('pedido.pedido_fecha <= :hasta', { hasta: query.fecha_hasta });
    }
    if (query.buscar) {
      qb.andWhere(
        '(pedido.pedido_numero LIKE :q OR pedido.pedido_notas LIKE :q)',
        { q: `%${query.buscar}%` },
      );
    }

    qb.orderBy(`pedido.${ordenPor}`, ordenDir)
      .skip((page - 1) * limit)
      .take(limit);

    const [pedidos, total] = await qb.getManyAndCount();

    return {
      data: pedidos.map((p) => this.toResponseDto(p)),
      total,
      page,
      limit,
      total_paginas: Math.ceil(total / limit),
    };
  }

  // ---------------------------------------------------------------------------
  // Internos
  // ---------------------------------------------------------------------------

  private async cargarEntidad(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { pedido_id: id },
      relations: { detalles: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  /** Solo el cliente dueño o un administrador pueden operar el pedido. */
  private verificarPermiso(pedido: Pedido, actor: ActorPedido): void {
    const esDueno =
      pedido.cliente_id === actor.usuario_id ||
      pedido.created_by === actor.usuario_id;
    if (!esDueno && actor.usuario_rol !== Rol.ADMIN) {
      throw new ForbiddenException('No tienes permiso sobre este pedido');
    }
  }

  /** Control de concurrencia optimista: 409 si la versión no coincide. */
  private verificarVersion(pedido: Pedido, version: number): void {
    if (pedido.pedido_version !== version) {
      throw new ConflictException(
        'El pedido fue modificado por otra operación; recarga e intenta de nuevo',
      );
    }
  }

  /** Valida que la dirección exista y pertenezca al cliente del pedido. */
  private async validarDireccion(
    direccionId: number,
    clienteId: number,
  ): Promise<void> {
    const direccion = await this.direccionRepository.findOneBy({
      direccion_envio_id: direccionId,
    });
    if (!direccion) throw new NotFoundException('Dirección de envío no encontrada');
    if (direccion.usuario_id !== clienteId) {
      throw new ForbiddenException(
        'La dirección de envío no pertenece al cliente del pedido',
      );
    }
  }

  /**
   * Descuenta stock de cada línea con bloqueo pesimista para evitar sobreventa.
   * Los productos sin registro de inventario no controlan stock (se omiten).
   *
   * @throws ConflictException Si el stock disponible es insuficiente.
   */
  private async descontarStock(
    manager: EntityManager,
    pedido: Pedido,
  ): Promise<void> {
    for (const linea of pedido.detalles) {
      const inventario = await manager.findOne(Inventario, {
        where: { producto_id: linea.producto_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inventario) continue; // Producto sin control de inventario.

      if (inventario.inventario_stock_actual < linea.detalle_pedido_cantidad) {
        throw new ConflictException(
          `Stock insuficiente para el producto ${linea.producto_id} ` +
            `(disponible ${inventario.inventario_stock_actual}, ` +
            `solicitado ${linea.detalle_pedido_cantidad})`,
        );
      }

      inventario.inventario_stock_actual -= linea.detalle_pedido_cantidad;
      inventario.inventario_fecha_actualizacion = new Date();
      await manager.save(inventario);
    }
  }

  /** Repone al inventario el stock de las líneas (al cancelar un pedido con stock descontado). */
  private async reponerStock(
    manager: EntityManager,
    pedido: Pedido,
  ): Promise<void> {
    for (const linea of pedido.detalles) {
      const inventario = await manager.findOne(Inventario, {
        where: { producto_id: linea.producto_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inventario) continue;

      inventario.inventario_stock_actual += linea.detalle_pedido_cantidad;
      inventario.inventario_fecha_actualizacion = new Date();
      await manager.save(inventario);
    }
  }

  /** Detecta un error de violación de restricción UNIQUE de MySQL. */
  private esViolacionUnicidad(err: unknown): boolean {
    const codigo = (err as { code?: string })?.code;
    return codigo === 'ER_DUP_ENTRY';
  }
}
