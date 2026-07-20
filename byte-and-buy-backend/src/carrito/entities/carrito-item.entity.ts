/**
 * Módulo de entidades de carrito
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Carrito } from './carrito.entity';
import { Producto } from '../../producto/entities/producto.entity';

/**
 * Entidad que representa un ítem del carrito de compras
 */
@Entity('carrito_item')
@Unique(['carrito_id', 'producto_id'])
export class CarritoItem {
  /** Identificador único del ítem del carrito */
  @PrimaryGeneratedColumn()
  carrito_item_id: number;

  /** Identificador del carrito */
  @Column({ type: 'int' })
  carrito_id: number;

  /** Carrito al que pertenece el ítem */
  @ManyToOne(() => Carrito, (carrito) => carrito.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrito_id' })
  carrito: Carrito;

  /** Identificador del producto */
  @Column({ type: 'int' })
  producto_id: number;

  /** Producto del ítem */
  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  /** Cantidad del producto en el carrito */
  @Column({ type: 'int' })
  cantidad: number;
}
