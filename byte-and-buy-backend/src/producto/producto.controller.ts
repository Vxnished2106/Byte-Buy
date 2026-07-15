import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  ForbiddenException,
} from '@nestjs/common';

import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { ProductoService } from './producto.service';
import { UsuarioService } from '../usuario/usuario.service';

import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

import { ResponseProductoDto } from './dto/response-producto.dto';
import { ResponseDetalleProductoDto } from './dto/response-detalle-producto.dto';
import { ResponseCatalogoProductoDto } from './dto/response-catalogo-producto.dto';

import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { Rol } from '../usuario/entities/usuario.entity';


@Controller('productos')
export class ProductoController {

  constructor(
    private readonly productoService: ProductoService,
    private readonly usuarioService: UsuarioService,
  ) { }

  private async validarAdmin(req: any): Promise<void> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);

    if (usuario.usuario_rol !== Rol.ADMIN) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  /**
   * Catálogo de productos
   */
  @Get('catalogo')
  async catalogo(): Promise<ResponseCatalogoProductoDto[]> {
    return this.productoService.mostrarCatalogo();
  }

  @Get('filtro')
  async filtrarProductos(
    @Query('categoria_ids') categoria_ids?: string,
    @Query('etiqueta_ids') etiqueta_ids?: string,
    @Query('nombre') nombre?: string,
    @Query('min') min?: string,
    @Query('max') max?: string,
  ): Promise<ResponseProductoDto[]> {

    return this.productoService.filtrarProductos(
      categoria_ids ? categoria_ids.split(',').map(Number) : undefined,
      etiqueta_ids ? etiqueta_ids.split(',').map(Number) : undefined,
      nombre,
      min ? Number(min) : undefined,
      max ? Number(max) : undefined,
    );
  }

  /**
   * Crear producto
   */
  @UseGuards(SupabaseAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'producto_imagen',
        maxCount: 1,
      },
      {
        name: 'producto_banner',
        maxCount: 1,
      },
    ]),
  )
  async crear(
    @Request() req: any,
    @Body() datos: CreateProductoDto,
    @UploadedFiles()
    files: {
      producto_imagen?: Express.Multer.File[];
      producto_banner?: Express.Multer.File[];
    },
  ): Promise<ResponseProductoDto> {

    console.log(datos);

    await this.validarAdmin(req);

    return this.productoService.registrarProducto(
      datos,
      files?.producto_imagen?.[0],
      files?.producto_banner?.[0],
    );
  }

  /**
   * Editar producto
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'producto_imagen',
        maxCount: 1,
      },
      {
        name: 'producto_banner',
        maxCount: 1,
      },
    ]),
  )
  async editar(
    @Request() req: any,
    @Param('id', ParseIntPipe) producto_id: number,
    @Body() datos: UpdateProductoDto,
    @UploadedFiles()
    files: {
      producto_imagen?: Express.Multer.File[];
      producto_banner?: Express.Multer.File[];
    },
  ): Promise<ResponseProductoDto> {

    await this.validarAdmin(req);

    return this.productoService.editarProducto(
      producto_id,
      datos,
      files?.producto_imagen?.[0],
      files?.producto_banner?.[0],
    );
  }

  /**
   * Detalle de producto
   */
  @Get(':id')
  async detalleProducto(
    @Param('id', ParseIntPipe)
    producto_id: number,
  ): Promise<ResponseDetalleProductoDto> {

    return this.productoService.obtenerDetalleProducto(
      producto_id,
    );
  }

}