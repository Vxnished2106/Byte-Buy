import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PedidoService, ActorPedido } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { ListarPedidosDto } from './dto/listar-pedidos.dto';
import {
  ResponsePedidoDto,
  ResponsePedidoPaginadoDto,
} from './dto/response-pedido.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador de pedidos.
 *
 * Su única responsabilidad es la capa HTTP: resolver el usuario autenticado y
 * delegar en el servicio. Ninguna regla de negocio vive aquí.
 */
@Controller('pedidos')
@UseGuards(SupabaseAuthGuard)
export class PedidoController {
  constructor(
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /** Resuelve el actor (id + rol) a partir del token de la petición. */
  private async actorDe(req: any): Promise<ActorPedido> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return { usuario_id: usuario.usuario_id, usuario_rol: usuario.usuario_rol };
  }

  /**
   * Crea un pedido en BORRADOR.
   * Acepta el header `Idempotency-Key` para evitar duplicados por reintento.
   */
  @Post()
  async crear(
    @Request() req: any,
    @Body() dto: CreatePedidoDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<ResponsePedidoDto> {
    const actor = await this.actorDe(req);
    return this.pedidoService.crear(dto, actor, idempotencyKey);
  }

  /** Lista pedidos con filtros, búsqueda, orden y paginación server-side. */
  @Get()
  listar(@Query() query: ListarPedidosDto): Promise<ResponsePedidoPaginadoDto> {
    return this.pedidoService.listar(query);
  }

  /** Obtiene un pedido con sus líneas e historial de estado. */
  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponsePedidoDto> {
    return this.pedidoService.obtener(id);
  }

  /** Edita cabecera y líneas de un pedido en BORRADOR (concurrencia optimista). */
  @Put(':id')
  async editar(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePedidoDto,
  ): Promise<ResponsePedidoDto> {
    const actor = await this.actorDe(req);
    return this.pedidoService.editar(id, dto, actor);
  }

  /** Ejecuta una transición de estado del pedido. */
  @Patch(':id/estado')
  async cambiarEstado(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoPedidoDto,
  ): Promise<ResponsePedidoDto> {
    const actor = await this.actorDe(req);
    return this.pedidoService.cambiarEstado(id, dto, actor);
  }

  /**
   * Confirma un pedido BORRADOR cuyo pago ya se completó fuera de este
   * módulo (checkout de venta/pago/detalle_compra, que descuenta el stock
   * directamente). No vuelve a descontar stock: solo alinea el estado del
   * pedido con la realidad para que una cancelación posterior lo reponga.
   */
  @Patch(':id/confirmar-pago')
  async confirmarPorPago(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponsePedidoDto> {
    const actor = await this.actorDe(req);
    return this.pedidoService.confirmarPorPago(id, actor);
  }
}
