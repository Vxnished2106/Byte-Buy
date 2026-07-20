/**
 * Módulo de entidades de inventario
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Producto } from '../../producto/entities/producto.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';

/**
 * Entidad que representa el inventario de un producto
 */
@Entity('inventario')
export class Inventario {

  /** Identificador único del inventario */
  @PrimaryGeneratedColumn()
  inventario_id: number;

  /** Stock actual disponible del producto */
  @Column({ type: 'int', default: 0 })
  inventario_stock_actual: number;

  /** Stock mínimo para generar alertas */
  @Column({ type: 'int', default: 0 })
  inventario_stock_minimo: number;

  /** Fecha de última actualización del inventario */
  @CreateDateColumn()
  inventario_fecha_actualizacion: Date;

  /** Identificador del producto asociado al inventario */
  @Column({ type: 'int', unique: true })
  producto_id: number;

  /** Producto asociado al inventario */
  @OneToOne(
    () => Producto,
    (producto) => producto.inventario,
  )
  @JoinColumn({
    name: 'producto_id',
  })
  producto: Producto;

}