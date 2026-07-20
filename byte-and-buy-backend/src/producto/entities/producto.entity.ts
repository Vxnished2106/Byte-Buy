/**
 * Módulo de entidades de producto
 */
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

/**
 * Estados posibles de un producto
 */
export enum ProductoEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

/**
 * Entidad que representa un producto en el sistema
 */
@Entity('producto')
export class Producto {
  /** Identificador único del producto */
  @PrimaryGeneratedColumn()
  producto_id: number;

  /** Nombre del producto */
  @Column({ type: 'varchar', length: 255 })
  producto_nombre: string;

  /** Estado del producto (activo o inactivo) */
  @Column({ type: 'varchar', length: 50, default: ProductoEstado.ACTIVO })
  producto_estado: ProductoEstado;

  /** Porcentaje de descuento aplicado al producto */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  producto_descuento: number;

  /** Porcentaje de impuesto aplicado al producto */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  producto_impuesto: number;

  /** Precio base del producto */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  producto_precio: number;

  /** URL de la imagen principal del producto */
  @Column({ type: 'varchar', length: 255, nullable: true })
  producto_imagen: string | null;

  /** URL del banner del producto */
  @Column({ type: 'varchar', length: 255, nullable: true })
  producto_banner: string | null;

  /** Descripción detallada del producto */
  @Column({ type: 'text', nullable: true })
  producto_descripcion: string | null;

  /** Categorías asociadas al producto */
  @ManyToMany(() => Categoria, (categoria) => categoria.productos)
  categorias: Categoria[];

  /** Etiquetas asociadas al producto */
  @ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.productos)
  etiquetas: Etiqueta[];

  /** Inventario asociado al producto */
  @OneToOne(() => Inventario, (inventario) => inventario.producto)
  inventario: Inventario;

  /** Relación con los proveedores del producto */
  @OneToMany(() => ProductoProveedor, (pp) => pp.producto)
  productoProveedores: ProductoProveedor[];
}