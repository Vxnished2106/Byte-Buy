import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Carrito } from './entities/carrito.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,
  ) {}

  /**
   * Obtiene el carrito del usuario autenticado; si aún no existe lo crea.
   * Se usa como punto de entrada de todas las operaciones del carrito para
   * garantizar que cada usuario opere siempre sobre su propio carrito.
   */
  async obtenerOCrearCarrito(usuario_id: number): Promise<Carrito> {
    let carrito = await this.carritoRepository.findOne({
      where: { usuario_id },
      relations: ['items', 'items.producto'],
    });

    if (!carrito) {
      carrito = await this.carritoRepository.save(
        this.carritoRepository.create({ usuario_id }),
      );
    }

    return carrito;
  }
}
