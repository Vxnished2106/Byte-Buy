import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { ResponseInventarioDto } from './dto/response-inventario.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { Rol } from '../usuario/entities/usuario.entity';

@Controller('inventarios')
@UseGuards(SupabaseAuthGuard)
export class InventarioController {

  constructor(
    private readonly inventarioService: InventarioService,
    private readonly usuarioService: UsuarioService,
  ) {}

  private async validarAdmin(req:any):Promise<void>{
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);

    if(usuario.usuario_rol !== Rol.ADMIN){
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  @Post()
  async registrarInventario(
    @Request() req:any,
    @Body() datos:CreateInventarioDto,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.registrarInventario(datos);
  }


  @Get()
  async listarInventario(
    @Request() req:any,
  ):Promise<ResponseInventarioDto[]>{

    await this.validarAdmin(req);

    return this.inventarioService.listarInventarioPorStock();
  }


  @Get('alertas-stock')
  async alertasStock(
    @Request() req:any,
  ):Promise<ResponseInventarioDto[]>{

    await this.validarAdmin(req);

    return this.inventarioService.obtenerProductosStockMinimo();
  }


  @Get('producto/:producto_id')
  async obtenerPorProducto(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.findByProducto(producto_id);
  }


  @Get('producto/:producto_id/verificar-stock')
  async verificarStockMinimo(
    @Request() req:any,
    @Param('producto_id',ParseIntPipe) producto_id:number,
  ):Promise<{alerta:boolean}>{

    await this.validarAdmin(req);

    return this.inventarioService.verificarStockMinimo(producto_id);
  }


  @Get(':inventario_id')
  async obtenerInventario(
    @Request() req:any,
    @Param('inventario_id',ParseIntPipe) inventario_id:number,
  ):Promise<ResponseInventarioDto>{

    await this.validarAdmin(req);

    return this.inventarioService.obtenerInventario(inventario_id);
  }


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