import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ProductoProveedor } from '../../producto_proveedor/entities/producto_proveedor.entity';
import { Inventario } from '../../inventario/entities/inventario.entity';

export enum ProveedorEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('proveedor')
export class Proveedor {
  @PrimaryGeneratedColumn()
  proveedor_id: number;

  @Column({ type: 'varchar', length: 100 })
  proveedor_nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  proveedor_correo: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  proveedor_telefono: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  proveedor_direccion: string | null;

  @Column({ type: 'varchar', length: 50, default: ProveedorEstado.ACTIVO })
  proveedor_estado: ProveedorEstado;

  @OneToMany(() => ProductoProveedor, (pp) => pp.proveedor)
  productosProveedor: ProductoProveedor[];

}