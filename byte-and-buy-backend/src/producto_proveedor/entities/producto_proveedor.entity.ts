/**
 * Módulo de entidades de producto-proveedor
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';

/**
 * Estados posibles de una relación producto-proveedor
 */
export enum ProductoProveedorEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

/**
 * Entidad que representa la relación entre un producto y un proveedor
 */
@Entity('producto_proveedor')
export class ProductoProveedor {
  /** Identificador único de la relación producto-proveedor */
  @PrimaryGeneratedColumn()
  producto_proveedor_id: number;

  /** Código de referencia del producto en el proveedor */
  @Column({ type: 'varchar', length: 100, nullable: true })
  producto_proveedor_codigo: string | null;

  /** Precio de compra del producto en este proveedor */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  producto_proveedor_precio: number;

  /** Estado de la relación producto-proveedor */
  @Column({ type: 'varchar', length: 50, default: ProductoProveedorEstado.ACTIVO })
  producto_proveedor_estado: ProductoProveedorEstado;

  /** Identificador del producto */
  @Column({ type: 'int' })
  producto_id: number;

  /** Producto relacionado */
  @ManyToOne(() => Producto, (producto) => producto.productoProveedores)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  /** Identificador del proveedor */
  @Column({ type: 'int' })
  proveedor_id: number;

  /** Proveedor relacionado */
  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productosProveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;
}