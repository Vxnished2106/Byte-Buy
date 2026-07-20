import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proveedor, ProveedorEstado } from './entities/proveedor.entity';

import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { ResponseProveedorDto } from './dto/response-proveedor.dto';

/**
 * Servicio para la gestión de proveedores.
 * Contiene métodos para crear, editar, cambiar estado y listar proveedores.
 */
@Injectable()
export class ProveedorService {

  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) { }

  /**
   * Convierte una entidad Proveedor a un DTO de respuesta.
   * @param proveedor - Entidad Proveedor a convertir
   * @param cantidad_productos - Cantidad de productos asociados al proveedor (opcional)
   * @returns DTO de respuesta con los datos del proveedor
   */
  private toResponseDto(
    proveedor: Proveedor,
    cantidad_productos?: number,
  ): ResponseProveedorDto {

    return {

      proveedor_id:
        proveedor.proveedor_id,

      proveedor_nombre:
        proveedor.proveedor_nombre,

      proveedor_correo:
        proveedor.proveedor_correo,

      proveedor_telefono:
        proveedor.proveedor_telefono,

      proveedor_direccion:
        proveedor.proveedor_direccion,

      proveedor_estado:
        proveedor.proveedor_estado,

      cantidad_productos,

    };
  }


  /**
   * Registrar proveedor
   */
  async registrarProveedor(
    datos: CreateProveedorDto,
  ): Promise<ResponseProveedorDto> {


    const existe =
      await this.proveedorRepository.findOne({
        where: {
          proveedor_nombre:
            datos.proveedor_nombre,
        },
      });


    if (existe) {
      throw new BadRequestException(
        'Ya existe un proveedor con ese nombre',
      );
    }


    if (datos.proveedor_correo) {

      const correoExiste =
        await this.proveedorRepository.findOne({
          where: {
            proveedor_correo:
              datos.proveedor_correo,
          },
        });


      if (correoExiste) {
        throw new BadRequestException(
          'El correo del proveedor ya está registrado',
        );
      }
    }


    const proveedor =
      this.proveedorRepository.create({
        ...datos,
        proveedor_estado:
          ProveedorEstado.ACTIVO,
      });


    const guardado =
      await this.proveedorRepository.save(
        proveedor,
      );


    return this.toResponseDto(
      guardado,
    );
  }


  /**
   * Editar proveedor
   */
  async editarProveedor(
    proveedor_id: number,
    datos: Partial<CreateProveedorDto>,
  ): Promise<ResponseProveedorDto> {


    const proveedor =
      await this.proveedorRepository.findOneBy({
        proveedor_id,
      });


    if (!proveedor) {
      throw new NotFoundException(
        'Proveedor no encontrado',
      );
    }



    if (
      datos.proveedor_nombre &&
      datos.proveedor_nombre !==
      proveedor.proveedor_nombre
    ) {


      const existe =
        await this.proveedorRepository.findOne({
          where: {
            proveedor_nombre:
              datos.proveedor_nombre,
          },
        });


      if (existe) {
        throw new BadRequestException(
          'Ya existe un proveedor con ese nombre',
        );
      }
    }



    if (
      datos.proveedor_correo &&
      datos.proveedor_correo !==
      proveedor.proveedor_correo
    ) {


      const correoExiste =
        await this.proveedorRepository.findOne({
          where: {
            proveedor_correo:
              datos.proveedor_correo,
          },
        });


      if (correoExiste) {
        throw new BadRequestException(
          'El correo del proveedor ya está registrado',
        );
      }
    }



    Object.assign(
      proveedor,
      datos,
    );


    const guardado =
      await this.proveedorRepository.save(
        proveedor,
      );


    return this.toResponseDto(
      guardado,
    );
  }



  /**
   * Obtener entidad proveedor
   * Uso interno de otros módulos
   */
  async findEntity(
    proveedor_id: number,
  ): Promise<Proveedor> {


    const proveedor =
      await this.proveedorRepository.findOneBy({
        proveedor_id,
      });


    if (!proveedor) {
      throw new NotFoundException(
        'Proveedor no encontrado',
      );
    }


    return proveedor;
  }

  /**
   * Valida que un proveedor exista y esté activo.
   * @param proveedor_id - ID del proveedor a validar
   * @returns true si el proveedor existe y está activo
   * @throws NotFoundException si el proveedor no existe
   * @throws BadRequestException si el proveedor está inactivo
   */
  async validarProveedorActivo(
    proveedor_id: number,
  ): Promise<boolean> {

    const proveedor =
      await this.proveedorRepository.findOneBy({
        proveedor_id,
      });


    if (!proveedor) {
      throw new NotFoundException(
        'Proveedor no encontrado',
      );
    }


    if (
      proveedor.proveedor_estado !==
      ProveedorEstado.ACTIVO
    ) {
      throw new BadRequestException(
        'El proveedor está inactivo',
      );
    }


    return true;
  }

  /**
   * Cambia el estado de un proveedor (activo ↔ inactivo).
   * @param proveedor_id - ID del proveedor a modificar
   * @returns DTO de respuesta con el proveedor actualizado
   * @throws NotFoundException si el proveedor no existe
   */
  async cambiarEstadoProveedor(
    proveedor_id: number,
  ): Promise<ResponseProveedorDto> {


    const proveedor =
      await this.proveedorRepository.findOneBy({
        proveedor_id,
      });


    if (!proveedor) {
      throw new NotFoundException(
        'Proveedor no encontrado',
      );
    }


    proveedor.proveedor_estado =
      proveedor.proveedor_estado ===
        ProveedorEstado.ACTIVO
        ? ProveedorEstado.INACTIVO
        : ProveedorEstado.ACTIVO;


    const guardado =
      await this.proveedorRepository.save(
        proveedor,
      );


    return this.toResponseDto(
      guardado,
    );
  }

  /**
   * Lista los proveedores, con filtros opcionales por nombre y estado.
   * @param nombre - Filtro por nombre del proveedor (opcional)
   * @param estado - Filtro por estado del proveedor (opcional)
   * @returns Lista de DTOs de respuesta con los proveedores
   */
  async mostrarProveedores(
    nombre?: string,
    estado?: ProveedorEstado,
  ): Promise<ResponseProveedorDto[]> {


    const query =
      this.proveedorRepository
        .createQueryBuilder('proveedor')
        .leftJoin(
          'proveedor.productosProveedor',
          'productoProveedor',
        )
        .addSelect(
          'COUNT(productoProveedor.producto_proveedor_id)',
          'cantidad_productos',
        )
        .groupBy(
          'proveedor.proveedor_id',
        );


    if (nombre) {

      query.andWhere(
        'LOWER(proveedor.proveedor_nombre) LIKE LOWER(:nombre)',
        {
          nombre: `%${nombre}%`,
        },
      );

    }


    if (estado) {

      query.andWhere(
        'proveedor.proveedor_estado = :estado',
        {
          estado,
        },
      );

    }


    const {
      entities,
      raw,
    } =
      await query.getRawAndEntities();


    return entities.map(
      (proveedor, index) => {

        return this.toResponseDto(
          proveedor,
          Number(
            raw[index]
              .cantidad_productos ?? 0,
          ),
        );

      },
    );
  }

}