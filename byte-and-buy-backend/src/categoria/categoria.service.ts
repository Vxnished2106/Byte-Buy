import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ResponseCategoriaDto } from './dto/response-categoria.dto';
import { ResponseCategoriaMasVendidaDto } from './dto/response-categoria-mas-vendida.dto';
import { FileUploadService } from '../auth/supabase-storage/file-upload.service';
import { ResponseProductoMasVendidoDto } from '../producto/dto/response-producto-mas-vendido.dto';

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
      const imagenAnterior = categoria.categoria_imagen;
      const nuevaImagen = await this.fileUploadService.uploadFile(
        imagen,
        'categoria',
      );

      if (nuevaImagen) {
        await this.categoriaRepository.update(
          { categoria_id },
          { categoria_imagen: nuevaImagen },
        );
        categoria.categoria_imagen = nuevaImagen;
        datos.categoria_imagen = nuevaImagen;

        try {
          await this.fileUploadService.deleteFileByPublicUrl(
            imagenAnterior,
            'categoria',
          );
        } catch {
          try {
            await this.fileUploadService.deleteFileByPublicUrl(
              nuevaImagen,
              'categoria',
            );
          } catch (e) {
            void e;
          }

          await this.categoriaRepository.update(
            { categoria_id },
            { categoria_imagen: imagenAnterior ?? null },
          );
          categoria.categoria_imagen = imagenAnterior ?? null;
          datos.categoria_imagen = imagenAnterior ?? null;
          throw new BadRequestException(
            'No se pudo eliminar la imagen anterior de la categoría',
          );
        }
      }
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

  async obtenerCategoriasMasVendidas(
    limit = 10,
  ): Promise<ResponseCategoriaMasVendidaDto[]> {
    const top = await this.categoriaRepository
      .createQueryBuilder('categoria')
      .innerJoin('categoria.productos', 'producto')
      .innerJoin('producto.detallesCompra', 'dc')
      .innerJoin('dc.venta', 'venta')
      .where('venta.venta_estado = :estado', {
        estado: 'aprobado',
      })
      .select('categoria.categoria_id', 'categoria_id')
      .addSelect('SUM(dc.detalle_compra_cantidad)', 'total_vendido')
      .groupBy('categoria.categoria_id')
      .orderBy('total_vendido', 'DESC')
      .limit(limit)
      .getRawMany<{ categoria_id: number; total_vendido: string }>();

    if (!top.length) {
      return [];
    }

    const ids = top.map((r) => Number(r.categoria_id));
    const totalById = new Map<number, number>(
      top.map((r) => [Number(r.categoria_id), Number(r.total_vendido)]),
    );

    const categorias = await this.categoriaRepository.find({
      where: {
        categoria_id: In(ids),
      },
      relations: [
        'productos',
        'productos.categorias',
        'productos.etiquetas',
        'productos.detallesCompra',
        'productos.detallesCompra.venta',
      ],
    });

    const categoriaById = new Map<number, Categoria>(
      categorias.map((c) => [c.categoria_id, c]),
    );

    return ids
      .map((id) => categoriaById.get(id))
      .filter((c): c is Categoria => Boolean(c))
      .map((categoria) => {
        const productos = (categoria.productos ?? [])
          .map((producto): ResponseProductoMasVendidoDto | null => {
            const detallesCompraAprobados = (producto.detallesCompra ?? []).filter(
              (dc) => dc.venta?.venta_estado === 'aprobado',
            );

            const totalProducto = detallesCompraAprobados.reduce(
              (acc, dc) => acc + Number(dc.detalle_compra_cantidad),
              0,
            );

            if (!totalProducto) {
              return null;
            }

            return {
              producto_id: producto.producto_id,
              producto_nombre: producto.producto_nombre,
              producto_estado: producto.producto_estado,
              producto_descripcion: producto.producto_descripcion,
              producto_precio: producto.producto_precio,
              producto_impuesto: producto.producto_impuesto,
              producto_descuento: producto.producto_descuento,
              producto_imagen: producto.producto_imagen,
              producto_banner: producto.producto_banner,
              categorias: producto.categorias ?? [],
              etiquetas: producto.etiquetas ?? [],
              total_vendido: totalProducto,
              detalles_compra: detallesCompraAprobados.map((dc) => ({
                detalle_compra_id: dc.detalle_compra_id,
                detalle_compra_cantidad: dc.detalle_compra_cantidad,
                detalle_compra_precio_unitario: Number(
                  dc.detalle_compra_precio_unitario,
                ),
                detalle_compra_descuento: Number(dc.detalle_compra_descuento),
                detalle_compra_impuesto: Number(dc.detalle_compra_impuesto),
                detalle_compra_subtotal: Number(dc.detalle_compra_subtotal),
                detalle_compra_total: Number(dc.detalle_compra_total),
                venta_id: dc.venta_id,
                venta_estado: dc.venta.venta_estado,
                venta_fecha: dc.venta.venta_fecha,
              })),
            };
          })
          .filter((p): p is ResponseProductoMasVendidoDto => Boolean(p))
          .sort((a, b) => b.total_vendido - a.total_vendido);

        return {
          categoria_id: categoria.categoria_id,
          categoria_nombre: categoria.categoria_nombre,
          categoria_descripcion: categoria.categoria_descripcion,
          categoria_imagen: categoria.categoria_imagen,
          total_vendido: totalById.get(categoria.categoria_id) ?? 0,
          productos,
        };
      });
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
