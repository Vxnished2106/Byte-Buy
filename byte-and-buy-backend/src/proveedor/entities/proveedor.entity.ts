import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ProductoProveedor } from '../../producto_proveedor/entities/producto_proveedor.entity';
import { Inventario } from '../../inventario/entities/inventario.entity';

/** Estados posibles de un proveedor. */
export enum ProveedorEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

/**
 * Entidad de proveedor.
 * Representa un proveedor de productos en la base de datos.
 */
@Entity('proveedor')
export class Proveedor {
  /** ID único del proveedor. */
  @PrimaryGeneratedColumn()
  proveedor_id: number;

  /** Nombre del proveedor. */
  @Column({ type: 'varchar', length: 100 })
  proveedor_nombre: string;

  /** Correo del proveedor (opcional). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  proveedor_correo: string | null;

  /** Teléfono del proveedor (opcional). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  proveedor_telefono: string | null;

  /** Dirección del proveedor (opcional). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  proveedor_direccion: string | null;

  /** Estado del proveedor (por defecto activo). */
  @Column({ type: 'varchar', length: 50, default: ProveedorEstado.ACTIVO })
  proveedor_estado: ProveedorEstado;

  /** Relaciones de productos que ofrece este proveedor. */
  @OneToMany(() => ProductoProveedor, (pp) => pp.proveedor)
  productosProveedor: ProductoProveedor[];

}
