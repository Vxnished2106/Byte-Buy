/**
 * Controlador para la gestión de productos
 */
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

/**
 * Controlador que maneja las peticiones HTTP para la gestión de productos
 */
@Controller('productos')
export class ProductoController {

  constructor(
    private readonly productoService: ProductoService,
    private readonly usuarioService: UsuarioService,
  ) { }

  /**
   * Valida que el usuario autenticado tenga rol de administrador
   * @param req - Objeto de solicitud HTTP
   * @throws ForbiddenException si el usuario no es administrador
   */
  private async validarAdmin(req: any): Promise<void> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);

    if (usuario.usuario_rol !== Rol.ADMIN) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  /**
   * Obtiene el catálogo de productos activos
   * @returns Lista de DTOs de catálogo de productos
   */
  @Get('catalogo')
  async catalogo(): Promise<ResponseCatalogoProductoDto[]> {
    return this.productoService.mostrarCatalogo();
  }

  /**
   * Filtra productos activos según diferentes criterios
   * @param categoria_ids - Identificadores de categorías separados por coma (opcional)
   * @param etiqueta_ids - Identificadores de etiquetas separados por coma (opcional)
   * @param nombre - Nombre o parte del nombre para filtrar (opcional)
   * @param min - Precio mínimo para filtrar (opcional)
   * @param max - Precio máximo para filtrar (opcional)
   * @returns Lista de DTOs de productos que cumplen con los filtros
   */
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
   * Crea un nuevo producto (solo para administradores)
   * @param req - Objeto de solicitud HTTP
   * @param datos - Datos del producto a crear
   * @param files - Archivos de imagen y banner del producto (opcionales)
   * @returns DTO de respuesta con el producto creado
   * @throws ForbiddenException si el usuario no es administrador
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
   * Edita un producto existente (solo para administradores)
   * @param req - Objeto de solicitud HTTP
   * @param producto_id - Identificador del producto a editar
   * @param datos - Datos del producto a actualizar
   * @param files - Nuevos archivos de imagen y banner del producto (opcionales)
   * @returns DTO de respuesta con el producto actualizado
   * @throws ForbiddenException si el usuario no es administrador
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
   * Obtiene los detalles de un producto activo
   * @param producto_id - Identificador del producto
   * @returns DTO de respuesta con los detalles del producto
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