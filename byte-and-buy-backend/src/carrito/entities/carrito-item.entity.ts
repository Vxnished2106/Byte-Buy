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

@Entity('carrito_item')
@Unique(['carrito_id', 'producto_id'])
export class CarritoItem {
  @PrimaryGeneratedColumn()
  carrito_item_id: number;

  @Column({ type: 'int' })
  carrito_id: number;

  @ManyToOne(() => Carrito, (carrito) => carrito.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrito_id' })
  carrito: Carrito;

  @Column({ type: 'int' })
  producto_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'int' })
  cantidad: number;
}
