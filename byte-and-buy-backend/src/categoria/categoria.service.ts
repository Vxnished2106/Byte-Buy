import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';
import { FileUploadService } from '../auth/supabase-storage/file-upload.service';

/**
 * Servicio de categorías.
 * Contiene la lógica para la gestión de categorías de productos.
 */
@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Convierte una entidad Categoria a su DTO de respuesta.
   * @param categoria Entidad Categoria.
   * @returns DTO de respuesta.
   */
  private toResponseDto(categoria: Categoria): ResponseCategoriaDto {
    return {
      categoria_id: categoria.categoria_id,
      categoria_nombre: categoria.categoria_nombre,
      categoria_descripcion: categoria.categoria_descripcion,
      categoria_imagen: categoria.categoria_imagen,
    };
  }

  /**
   * Obtiene todas las categorías ordenadas por nombre.
   * @returns Lista de categorías.
   */
  async mostrarCategorias(): Promise<ResponseCategoriaDto[]> {
    const categorias = await this.categoriaRepository.find({
      order: {
        categoria_nombre: 'ASC',
      },
    });

    return categorias.map((categoria) => this.toResponseDto(categoria));
  }

  /**
   * Registra una nueva categoría.
   * @param datos Datos de la categoría.
   * @param imagen Imagen de la categoría (opcional).
   * @returns Categoría registrada.
   * @throws BadRequestException Si ya existe una categoría con el mismo nombre.
   */
  async registrarCategoria(
    datos: CreateCategoriaDto,
    imagen?: Express.Multer.File,
  ): Promise<ResponseCategoriaDto> {
    const existe = await this.categoriaRepository.findOne({
      where: {
        categoria_nombre: datos.categoria_nombre,
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe una categoría con ese nombre',
      );
    }

    if (imagen) {
      datos.categoria_imagen = await this.fileUploadService.uploadFile(
        imagen,
        'categoria',
      );
    }

    const categoria = this.categoriaRepository.create(datos);

    const guardado = await this.categoriaRepository.save(categoria);

    return this.toResponseDto(guardado);
  }

  /**
   * Edita una categoría existente.
   * @param categoria_id ID de la categoría.
   * @param datos Nuevos datos de la categoría.
   * @param imagen Nueva imagen de la categoría (opcional).
   * @returns Categoría editada.
   * @throws NotFoundException Si la categoría no existe.
   * @throws BadRequestException Si ya existe una categoría con el mismo nombre.
   */
  async editarCategoria(
    categoria_id: number,
    datos: UpdateCategoriaDto,
    imagen?: Express.Multer.File,
  ): Promise<ResponseCategoriaDto> {
    const categoria = await this.categoriaRepository.findOne({
      where: {
        categoria_id,
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        'Categoría no encontrada',
      );
    }

    if (
      datos.categoria_nombre &&
      datos.categoria_nombre !== categoria.categoria_nombre
    ) {
      const existe = await this.categoriaRepository.findOne({
        where: {
          categoria_nombre: datos.categoria_nombre,
        },
      });

      if (existe) {
        throw new BadRequestException(
          'Ya existe una categoría con ese nombre',
        );
      }
    }

    if (imagen) {
      datos.categoria_imagen = await this.fileUploadService.uploadFile(
        imagen,
        'categoria',
      );
    }

    Object.assign(categoria, datos);

    const guardado = await this.categoriaRepository.save(categoria);

    return this.toResponseDto(guardado);
  }

  /**
   * Obtiene una categoría por su ID.
   * @param categoria_id ID de la categoría.
   * @returns DTO de la categoría.
   * @throws NotFoundException Si la categoría no existe.
   */
  async obtenerCategoria(
    categoria_id: number,
  ): Promise<ResponseCategoriaDto> {
    const categoria = await this.categoriaRepository.findOne({
      where: {
        categoria_id,
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        'Categoría no encontrada',
      );
    }

    return this.toResponseDto(categoria);
  }

  /**
   * Obtiene la entidad de una categoría por su ID.
   * @param categoria_id ID de la categoría.
   * @returns Entidad Categoria.
   * @throws NotFoundException Si la categoría no existe.
   */
  async findEntity(
    categoria_id: number,
  ): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: {
        categoria_id,
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        'Categoría no encontrada',
      );
    }

    return categoria;
  }
}