import { Controller, Get, Post, Param, Body, ParseIntPipe, ForbiddenException, UploadedFile, UseInterceptors, Request, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../usuario/entities/usuario.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador de categorías.
 * Maneja las rutas relacionadas con la gestión de categorías de productos.
 */
@Controller('categorias')
export class CategoriaController {
  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly usuarioService: UsuarioService,
  ) { }

  /**
   * Valida que el usuario autenticado tenga rol de administrador.
   * @param req Request con el usuario autenticado.
   * @throws ForbiddenException Si el usuario no es administrador.
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
   * Obtiene todas las categorías.
   * @returns Lista de categorías.
   */
  @Get()
  async mostrarCategorias(): Promise<ResponseCategoriaDto[]> {
    return this.categoriaService.mostrarCategorias();
  }

  /**
   * Registra una nueva categoría (solo para administradores).
   * @param req Request con el usuario autenticado.
   * @param datos Datos de la categoría.
   * @param file Imagen de la categoría (opcional).
   * @returns Categoría registrada.
   */
  @UseGuards(SupabaseAuthGuard)
  @Post('registrar')
  @UseInterceptors(FileInterceptor('categoria_imagen'))
  async registrarCategoria(
    @Request() req: any,
    @Body() datos: CreateCategoriaDto,
    @UploadedFile() file?: Express.Multer.File,): Promise<ResponseCategoriaDto> {

    await this.validarAdmin(req);

    return this.categoriaService.registrarCategoria(datos, file);
  }

}
