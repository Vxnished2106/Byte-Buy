/**
 * Controlador para la gestión de relaciones producto-proveedor
 */
import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';

import { ProductoProveedorService } from './producto-proveedor.service';
import { AsignarProveedorDto } from './dto/asignar-proveedor.dto';
import { ResponseProductoProveedorDto } from './dto/response-producto-proveedor.dto';

import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../usuario/entities/usuario.entity';
import { ProductoProveedorEstado } from './entities/producto_proveedor.entity';

/**
 * Controlador que maneja las peticiones HTTP para la gestión de relaciones entre productos y proveedores
 */
@Controller('producto-proveedor')
@UseGuards(SupabaseAuthGuard)
export class ProductoProveedorController {

  constructor(
    private readonly productoProveedorService: ProductoProveedorService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * Valida que el usuario autenticado tenga rol de administrador
   * @param req - Objeto de solicitud HTTP
   * @throws ForbiddenException si el usuario no es administrador
   */
  private async validarAdmin(req:any):Promise<void>{

    const usuario =
      await this.usuarioService.getOrCreateFromToken(
        req.user,
      );

    if(usuario.usuario_rol !== Rol.ADMIN){
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  /**
   * Asigna un proveedor a un producto
   * @param req - Objeto de solicitud HTTP
   * @param datos - Datos de la relación producto-proveedor a crear
   * @returns DTO de respuesta con la relación creada
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Post('asignar')
  async asignarProveedor(
    @Request() req:any,
    @Body() datos:AsignarProveedorDto,
  ):Promise<ResponseProductoProveedorDto>{

    await this.validarAdmin(req);

    return this.productoProveedorService.asignarProveedor(datos);
  }

  /**
   * Lista los proveedores asociados a un producto
   * @param req - Objeto de solicitud HTTP
   * @param producto_id - Identificador del producto
   * @returns Lista de DTOs de respuesta con los proveedores del producto
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Get('producto/:producto_id')
  async listarProveedoresPorProducto(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
  ):Promise<ResponseProductoProveedorDto[]>{

    await this.validarAdmin(req);

    return this.productoProveedorService.listarProveedoresPorProducto(
      producto_id,
    );
  }

  /**
   * Actualiza el precio de compra de un producto en un proveedor
   * @param req - Objeto de solicitud HTTP
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @param body - Datos con el nuevo precio
   * @returns DTO de respuesta con la relación actualizada
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Patch(':producto_proveedor_id/precio')
  async actualizarPrecioCompra(
    @Request() req:any,
    @Param('producto_proveedor_id',ParseIntPipe) producto_proveedor_id:number,
    @Body() body:{nuevoPrecio:number},
  ):Promise<ResponseProductoProveedorDto>{

    await this.validarAdmin(req);

    return this.productoProveedorService.actualizarPrecioCompra(
      producto_proveedor_id,
      body.nuevoPrecio,
    );
  }

  /**
   * Cambia el estado de una relación producto-proveedor
   * @param req - Objeto de solicitud HTTP
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @param body - Datos con el nuevo estado
   * @returns DTO de respuesta con la relación actualizada
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Patch(':producto_proveedor_id/estado')
  async cambiarEstado(
    @Request() req:any,
    @Param('producto_proveedor_id',ParseIntPipe) producto_proveedor_id:number,
    @Body() body:{estado:ProductoProveedorEstado},
  ):Promise<ResponseProductoProveedorDto>{

    await this.validarAdmin(req);

    return this.productoProveedorService.cambiarEstado(
      producto_proveedor_id,
      body.estado,
    );
  }

  /**
   * Elimina una relación producto-proveedor
   * @param req - Objeto de solicitud HTTP
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @throws ForbiddenException si el usuario no es administrador
   */
  @Delete(':producto_proveedor_id')
  async eliminarAsignacion(
    @Request() req:any,
    @Param('producto_proveedor_id',ParseIntPipe) producto_proveedor_id:number,
  ):Promise<void>{

    await this.validarAdmin(req);

    return this.productoProveedorService.eliminarAsignacion(
      producto_proveedor_id,
    );
  }
}