/**
 * Servicio para la gestión de productos
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Producto, ProductoEstado } from './entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { Etiqueta } from '../etiqueta/entities/etiqueta.entity';
import { Inventario } from '../inventario/entities/inventario.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ResponseProductoDto } from './dto/response-producto.dto';
import { ResponseDetalleProductoDto } from './dto/response-detalle-producto.dto';
import { ResponseCatalogoProductoDto } from './dto/response-catalogo-producto.dto';
import { ResponseProductoMasVendidoDto } from './dto/response-producto-mas-vendido.dto';
import { FileUploadService } from '../auth/supabase-storage/file-upload.service';

/**
 * Servicio que maneja la lógica de negocio para los productos
 */
@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    private readonly fileUploadService: FileUploadService,
  ) { }

  /**
   * Convierte una entidad Producto a un DTO de respuesta
   * @param producto - Entidad Producto a convertir
   * @returns DTO de respuesta con los datos del producto
   */
  private toResponseDto(producto: Producto): ResponseProductoDto {
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
      categorias: producto.categorias,
      etiquetas: producto.etiquetas,
    };
  }

  /**
   * Registra un nuevo producto en el sistema
   * @param datos - Datos del producto a crear
   * @param imagen - Archivo de imagen del producto (opcional)
   * @param banner - Archivo de banner del producto (opcional)
   * @returns DTO de respuesta con el producto creado
   * @throws BadRequestException si ya existe un producto con el mismo nombre
   */
  async registrarProducto(
    datos: CreateProductoDto,
    imagen?: Express.Multer.File,
    banner?: Express.Multer.File,
  ): Promise<ResponseProductoDto> {

    const existe = await this.productoRepository.findOne({
      where: {
        producto_nombre: datos.producto_nombre,
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe un producto con ese nombre',
      );
    }


    if (imagen) {
      datos.producto_imagen =
        await this.fileUploadService.uploadFile(
          imagen,
          'producto',
        );
    }


    if (banner) {
      datos.producto_banner =
        await this.fileUploadService.uploadFile(
          banner,
          'producto',
        );
    }


    const producto = this.productoRepository.create({
      producto_nombre: datos.producto_nombre,
      producto_descripcion: datos.producto_descripcion ?? null,
      producto_precio: datos.producto_precio,
      producto_impuesto: datos.producto_impuesto ?? 0,
      producto_descuento: datos.producto_descuento ?? 0,
      producto_imagen: datos.producto_imagen ?? null,
      producto_banner: datos.producto_banner ?? null,
      producto_estado:
        datos.producto_estado ?? ProductoEstado.ACTIVO,
    });


    if (datos.categoria_ids?.length) {
      producto.categorias = datos.categoria_ids.map(
        (categoria_id) =>
          ({ categoria_id } as Categoria),
      );
    }


    if (datos.etiqueta_ids?.length) {
      producto.etiquetas = datos.etiqueta_ids.map(
        (etiqueta_id) =>
          ({ etiqueta_id } as Etiqueta),
      );
    }


    const guardado =
      await this.productoRepository.save(producto);


    const productoCompleto =
      await this.productoRepository.findOne({
        where: {
          producto_id: guardado.producto_id,
        },
        relations: [
          'categorias',
          'etiquetas',
        ],
      });


    return this.toResponseDto(productoCompleto!);
  }

  /**
   * Edita un producto existente en el sistema
   * @param producto_id - Identificador del producto a editar
   * @param datos - Datos del producto a actualizar
   * @param imagen - Nuevo archivo de imagen del producto (opcional)
   * @param banner - Nuevo archivo de banner del producto (opcional)
   * @returns DTO de respuesta con el producto actualizado
   * @throws NotFoundException si el producto no existe
   * @throws BadRequestException si ya existe un producto con el mismo nombre
   */
  async editarProducto(
    producto_id: number,
    datos: UpdateProductoDto,
    imagen?: Express.Multer.File,
    banner?: Express.Multer.File,
  ): Promise<ResponseProductoDto> {


    const producto =
      await this.productoRepository.findOne({
        where: {
          producto_id,
        },
        relations: [
          'categorias',
          'etiquetas',
        ],
      });


    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado',
      );
    }


    if (
      datos.producto_nombre &&
      datos.producto_nombre !== producto.producto_nombre
    ) {

      const existe =
        await this.productoRepository.findOne({
          where: {
            producto_nombre:
              datos.producto_nombre,
          },
        });


      if (existe) {
        throw new BadRequestException(
          'Ya existe un producto con ese nombre',
        );
      }
    }


    if (imagen) {
      const imagenAnterior = producto.producto_imagen;
      const nuevaImagen =
        await this.fileUploadService.uploadFile(
          imagen,
          'producto',
        );

      if (nuevaImagen) {
        await this.productoRepository.update(
          { producto_id },
          { producto_imagen: nuevaImagen },
        );
        producto.producto_imagen = nuevaImagen;

        try {
          await this.fileUploadService.deleteFileByPublicUrl(
            imagenAnterior,
            'producto',
          );
        } catch {
          try {
            await this.fileUploadService.deleteFileByPublicUrl(
              nuevaImagen,
              'producto',
            );
          } catch (e) {
            void e;
          }

          await this.productoRepository.update(
            { producto_id },
            { producto_imagen: imagenAnterior ?? null },
          );
          producto.producto_imagen = imagenAnterior ?? null;
          throw new BadRequestException(
            'No se pudo eliminar la imagen anterior del producto',
          );
        }
      }
    }


    if (banner) {
      const bannerAnterior = producto.producto_banner;
      const nuevoBanner =
        await this.fileUploadService.uploadFile(
          banner,
          'producto',
        );

      if (nuevoBanner) {
        await this.productoRepository.update(
          { producto_id },
          { producto_banner: nuevoBanner },
        );
        producto.producto_banner = nuevoBanner;

        try {
          await this.fileUploadService.deleteFileByPublicUrl(
            bannerAnterior,
            'producto',
          );
        } catch {
          try {
            await this.fileUploadService.deleteFileByPublicUrl(
              nuevoBanner,
              'producto',
            );
          } catch (e) {
            void e;
          }

          await this.productoRepository.update(
            { producto_id },
            { producto_banner: bannerAnterior ?? null },
          );
          producto.producto_banner = bannerAnterior ?? null;
          throw new BadRequestException(
            'No se pudo eliminar el banner anterior del producto',
          );
        }
      }
    }


    producto.producto_nombre =
      datos.producto_nombre ??
      producto.producto_nombre;

    producto.producto_descripcion =
      datos.producto_descripcion ??
      producto.producto_descripcion;

    producto.producto_precio =
      datos.producto_precio ??
      producto.producto_precio;

    producto.producto_impuesto =
      datos.producto_impuesto ??
      producto.producto_impuesto;

    producto.producto_descuento =
      datos.producto_descuento ??
      producto.producto_descuento;

    producto.producto_imagen =
      datos.producto_imagen ??
      producto.producto_imagen;

    producto.producto_banner =
      datos.producto_banner ??
      producto.producto_banner;

    producto.producto_estado =
      datos.producto_estado ??
      producto.producto_estado;


    if (datos.categoria_ids) {
      producto.categorias =
        datos.categoria_ids.map(
          (categoria_id) =>
            ({ categoria_id } as Categoria),
        );
    }


    if (datos.etiqueta_ids) {
      producto.etiquetas =
        datos.etiqueta_ids.map(
          (etiqueta_id) =>
            ({ etiqueta_id } as Etiqueta),
        );
    }


    const actualizado =
      await this.productoRepository.save(producto);


    return this.toResponseDto(actualizado);
  }

  /**
   * Obtiene el catálogo de productos activos
   * @returns Lista de DTOs de catálogo de productos
   */
  async mostrarCatalogo(): Promise<ResponseCatalogoProductoDto[]> {

    const productos =
      await this.productoRepository.find({
        where: {
          producto_estado:
            ProductoEstado.ACTIVO,
        },
        relations: [
          'inventario',
        ],
      });


    return productos.map((producto) => {

      const stock =
        producto.inventario
          ? producto.inventario.inventario_stock_actual
          : 0;


      return {
        producto_id:
          producto.producto_id,

        producto_nombre:
          producto.producto_nombre,

        producto_precio:
          producto.producto_precio,

        producto_imagen:
          producto.producto_imagen,

        disponible:
          stock > 0,
      };
    });
  }

  /**
   * Obtiene los detalles de un producto activo
   * @param producto_id - Identificador del producto
   * @returns DTO de respuesta con los detalles del producto
   * @throws NotFoundException si el producto no existe o está inactivo
   */
  async obtenerDetalleProducto(
    producto_id: number,
  ): Promise<ResponseDetalleProductoDto> {


    const producto =
      await this.productoRepository.findOne({
        where: {
          producto_id,
          producto_estado:
            ProductoEstado.ACTIVO,
        },
        relations: [
          'categorias',
          'etiquetas',
          'inventario',
        ],
      });


    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado',
      );
    }


    const stock =
      producto.inventario
        ? producto.inventario.inventario_stock_actual
        : 0;


    return {
      producto_id:
        producto.producto_id,

      producto_nombre:
        producto.producto_nombre,

      producto_estado:
        producto.producto_estado,

      producto_descripcion:
        producto.producto_descripcion,

      producto_precio:
        producto.producto_precio,

      producto_impuesto:
        producto.producto_impuesto,

      producto_descuento:
        producto.producto_descuento,

      producto_imagen:
        producto.producto_imagen,

      producto_banner:
        producto.producto_banner,

      categorias:
        producto.categorias,

      etiquetas:
        producto.etiquetas,

      stock_actual:
        stock,

      puedeComprar:
        stock > 0,
    };
  }

  /**
   * Filtra productos activos según diferentes criterios
   * @param categoria_ids - Identificadores de categorías para filtrar (opcional)
   * @param etiqueta_ids - Identificadores de etiquetas para filtrar (opcional)
   * @param nombre - Nombre o parte del nombre para filtrar (opcional)
   * @param precio_min - Precio mínimo para filtrar (opcional)
   * @param precio_max - Precio máximo para filtrar (opcional)
   * @returns Lista de DTOs de productos que cumplen con los filtros
   */
  async filtrarProductos(
    categoria_ids?: number[],
    etiqueta_ids?: number[],
    nombre?: string,
    precio_min?: number,
    precio_max?: number,
  ): Promise<ResponseProductoDto[]> {

    const query = this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categorias', 'categoria')
      .leftJoinAndSelect('producto.etiquetas', 'etiqueta')
      .leftJoinAndSelect('producto.inventario', 'inventario')
      .where('producto.producto_estado = :estado', {
        estado: ProductoEstado.ACTIVO,
      });

    if (nombre?.trim()) {
      query.andWhere(
        'LOWER(producto.producto_nombre) LIKE LOWER(:nombre)',
        { nombre: `%${nombre.trim()}%` },
      );
    }

    if (categoria_ids?.length) {
      query.andWhere(
        'categoria.categoria_id IN (:...categoria_ids)',
        { categoria_ids },
      );
    }

    if (etiqueta_ids?.length) {
      query.andWhere(
        'etiqueta.etiqueta_id IN (:...etiqueta_ids)',
        { etiqueta_ids },
      );
    }

    if (precio_min != null) {
      query.andWhere(
        'producto.producto_precio >= :precio_min',
        { precio_min },
      );
    }

    if (precio_max != null) {
      query.andWhere(
        'producto.producto_precio <= :precio_max',
        { precio_max },
      );
    }

    const productos = await query
      .distinct(true)
      .getMany();

    return productos.map((producto) =>
      this.toResponseDto(producto),
    );
  }

  async obtenerProductosMasVendidos(
    limit = 10,
  ): Promise<ResponseProductoMasVendidoDto[]> {
    const top = await this.productoRepository
      .createQueryBuilder('producto')
      .innerJoin('producto.detallesCompra', 'dc')
      .innerJoin('dc.venta', 'venta')
      .where('venta.venta_estado = :estado', {
        estado: 'aprobado',
      })
      .select('producto.producto_id', 'producto_id')
      .addSelect('SUM(dc.detalle_compra_cantidad)', 'total_vendido')
      .groupBy('producto.producto_id')
      .orderBy('total_vendido', 'DESC')
      .limit(limit)
      .getRawMany<{ producto_id: number; total_vendido: string }>();

    if (!top.length) {
      return [];
    }

    const ids = top.map((r) => Number(r.producto_id));
    const totalById = new Map<number, number>(
      top.map((r) => [Number(r.producto_id), Number(r.total_vendido)]),
    );

    const productos = await this.productoRepository.find({
      where: {
        producto_id: In(ids),
      },
      relations: [
        'categorias',
        'etiquetas',
        'detallesCompra',
        'detallesCompra.venta',
      ],
    });

    const productoById = new Map<number, Producto>(
      productos.map((p) => [p.producto_id, p]),
    );

    return ids
      .map((id) => productoById.get(id))
      .filter((p): p is Producto => Boolean(p))
      .map((producto) => {
        const detalles_compra = (producto.detallesCompra ?? [])
          .filter((dc) => dc.venta?.venta_estado === 'aprobado')
          .map((dc) => ({
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
          }));

        return {
          ...this.toResponseDto(producto),
          total_vendido: totalById.get(producto.producto_id) ?? 0,
          detalles_compra,
        };
      });
  }

  async findEntity(productoId: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: {
        producto_id: productoId,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }
}
