import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';

import { ProductoProveedorService } from './producto-proveedor.service';
import { AsignarProveedorDto } from './dto/asignar-proveedor.dto';
import { ResponseProductoProveedorDto } from './dto/response-producto-proveedor.dto';

import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../usuario/entities/usuario.entity';
import { ProductoProveedorEstado } from './entities/producto_proveedor.entity';


@Controller('producto-proveedor')
@UseGuards(SupabaseAuthGuard)
export class ProductoProveedorController {

  constructor(
    private readonly productoProveedorService: ProductoProveedorService,
    private readonly usuarioService: UsuarioService,
  ) {}


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


  @Post('asignar')
  async asignarProveedor(
    @Request() req:any,
    @Body() datos:AsignarProveedorDto,
  ):Promise<ResponseProductoProveedorDto>{

    await this.validarAdmin(req);

    return this.productoProveedorService.asignarProveedor(datos);
  }



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