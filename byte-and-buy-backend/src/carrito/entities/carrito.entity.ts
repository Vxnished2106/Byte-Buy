/**
 * Módulo de entidades de carrito
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { CarritoItem } from './carrito-item.entity';
import { Venta } from '../../venta/entities/venta.entity';

/**
 * Entidad que representa el carrito de compras de un usuario
 */
@Entity('carrito')
export class Carrito {
  /** Identificador único del carrito */
  @PrimaryGeneratedColumn()
  carrito_id: number;

  /** Identificador del usuario (un carrito por usuario) */
  @Column({ type: 'int', unique: true })
  usuario_id: number;

  /** Usuario asociado al carrito */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** Ítems del carrito */
  @OneToMany(() => CarritoItem, (item) => item.carrito, { cascade: true })
  items: CarritoItem[];

  /** Fecha de creación del carrito */
  @CreateDateColumn()
  carrito_fecha_creacion: Date;

  /** Fecha de última actualización del carrito */
  @UpdateDateColumn()
  carrito_fecha_actualizacion: Date;

  /** Ventas asociadas al carrito */
  @OneToMany(() => Venta, (venta) => venta.carrito)
  ventas: Venta[];
}
