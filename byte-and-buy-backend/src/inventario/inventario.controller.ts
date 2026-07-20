/**
 * Controlador para la gestión de inventarios
 */
import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { ResponseInventarioDto } from './dto/response-inventario.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { Rol } from '../usuario/entities/usuario.entity';

/**
 * Controlador que maneja las peticiones HTTP para la gestión de inventarios
 */
@Controller('inventarios')
@UseGuards(SupabaseAuthGuard)
export class InventarioController {

  constructor(
    private readonly inventarioService: InventarioService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * Valida que el usuario autenticado tenga rol de administrador
   * @param req - Objeto de solicitud HTTP
   * @throws ForbiddenException si el usuario no es administrador
   */
  private async validarAdmin(req:any):Promise<void>{
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);

    if(usuario.usuario_rol !== Rol.ADMIN){
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  /**
   * Registra un nuevo inventario para un producto
   * @param req - Objeto de solicitud HTTP
   * @param datos - Datos del inventario a crear
   * @returns DTO de respuesta con el inventario creado
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Post()
  async registrarInventario(
    @Request() req:any,
    @Body() datos:CreateInventarioDto,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.registrarInventario(datos);
  }

  /**
   * Lista todos los inventarios ordenados por stock actual
   * @param req - Objeto de solicitud HTTP
   * @returns Lista de DTOs de inventarios
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Get()
  async listarInventario(
    @Request() req:any,
  ):Promise<ResponseInventarioDto[]>{

    await this.validarAdmin(req);

    return this.inventarioService.listarInventarioPorStock();
  }

  /**
   * Obtiene los productos con stock igual o menor al mínimo
   * @param req - Objeto de solicitud HTTP
   * @returns Lista de DTOs de inventarios con stock mínimo
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Get('alertas-stock')
  async alertasStock(
    @Request() req:any,
  ):Promise<ResponseInventarioDto[]>{

    await this.validarAdmin(req);

    return this.inventarioService.obtenerProductosStockMinimo();
  }

  /**
   * Obtiene un inventario por el identificador del producto
   * @param req - Objeto de solicitud HTTP
   * @param producto_id - Identificador del producto
   * @returns DTO de respuesta con el inventario
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Get('producto/:producto_id')
  async obtenerPorProducto(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.findByProducto(producto_id);
  }

  /**
   * Verifica si un producto tiene stock igual o menor al mínimo
   * @param req - Objeto de solicitud HTTP
   * @param producto_id - Identificador del producto
   * @returns Objeto con la alerta de stock mínimo
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Get('producto/:producto_id/verificar-stock')
  async verificarStockMinimo(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
  ):Promise<{alerta:boolean}>{

    await this.validarAdmin(req);

    return this.inventarioService.verificarStockMinimo(producto_id);
  }

  /**
   * Obtiene un inventario por su identificador
   * @param req - Objeto de solicitud HTTP
   * @param inventario_id - Identificador del inventario
   * @returns DTO de respuesta con el inventario
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Get(':inventario_id')
  async obtenerInventario(
    @Request() req:any,
    @Param('inventario_id',ParseIntPipe) inventario_id:number,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.obtenerInventario(inventario_id);
  }

  /**
   * Aumenta el stock de un producto
   * @param req - Objeto de solicitud HTTP
   * @param producto_id - Identificador del producto
   * @param body - Datos con la cantidad a aumentar
   * @returns DTO de respuesta con el inventario actualizado
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Patch('producto/:producto_id/entrada')
  async entradaStock(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
    @Body() body:{cantidad:number},
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.aumentarStock(
      producto_id,
      body.cantidad,
    );
  }

  /**
   * Descuenta el stock de un producto
   * @param req - Objeto de solicitud HTTP
   * @param producto_id - Identificador del producto
   * @param body - Datos con la cantidad a descontar
   * @returns DTO de respuesta con el inventario actualizado
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Patch('producto/:producto_id/salida')
  async salidaStock(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
    @Body() body:{cantidad:number},
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.descontarStock(
      producto_id,
      body.cantidad,
    );
  }

  /**
   * Edita un inventario existente
   * @param req - Objeto de solicitud HTTP
   * @param inventario_id - Identificador del inventario
   * @param datos - Datos del inventario a actualizar
   * @returns DTO de respuesta con el inventario actualizado
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Patch(':inventario_id')
  async editarInventario(
    @Request() req:any,
    @Param('inventario_id',ParseIntPipe) inventario_id:number,
    @Body() datos:UpdateInventarioDto,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.editarInventario(
      inventario_id,
      datos,
    );
  }
}