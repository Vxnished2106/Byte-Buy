import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';

export enum ProductoProveedorEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('producto_proveedor')
export class ProductoProveedor {
  @PrimaryGeneratedColumn()
  producto_proveedor_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  producto_proveedor_codigo: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  producto_proveedor_precio: number;

  @Column({ type: 'varchar', length: 50, default: ProductoProveedorEstado.ACTIVO })
  producto_proveedor_estado: ProductoProveedorEstado;

  @Column({ type: 'int' })
  producto_id: number;

  @ManyToOne(() => Producto, (producto) => producto.productoProveedores)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'int' })
  proveedor_id: number;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productosProveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;
}