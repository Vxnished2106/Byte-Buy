import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Etiqueta } from '../../etiqueta/entities/etiqueta.entity';
import { Inventario } from '../../inventario/entities/inventario.entity';
import { ProductoProveedor } from '../../producto_proveedor/entities/producto_proveedor.entity';

export enum ProductoEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn()
  producto_id: number;

  @Column({ type: 'varchar', length: 255 })
  producto_nombre: string;

  @Column({ type: 'varchar', length: 50, default: ProductoEstado.ACTIVO })
  producto_estado: ProductoEstado;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  producto_descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  producto_impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  producto_precio: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  producto_imagen: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  producto_banner: string | null;

  @Column({ type: 'text', nullable: true })
  producto_descripcion: string | null;

  @ManyToMany(() => Categoria, (categoria) => categoria.productos)
  categorias: Categoria[];

  @ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.productos)
  etiquetas: Etiqueta[];

  @OneToOne(() => Inventario, (inventario) => inventario.producto)
  inventario: Inventario;

  @OneToMany(() => ProductoProveedor, (pp) => pp.producto)
  productoProveedores: ProductoProveedor[];
}