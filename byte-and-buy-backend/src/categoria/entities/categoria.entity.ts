import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

/**
 * Entidad de categoría.
 * Representa una categoría de productos en la base de datos.
 */
@Entity('categoria')
export class Categoria {
  /** ID único de la categoría. */
  @PrimaryGeneratedColumn()
  categoria_id: number;

  /** Nombre de la categoría (único). */
  @Column({ type: 'varchar', length: 100, unique: true })
  categoria_nombre: string;

  /** Descripción de la categoría (opcional). */
  @Column({ type: 'text', nullable: true })
  categoria_descripcion: string | null;

  /** URL de la imagen de la categoría (opcional). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  categoria_imagen: string | null;

  /** Productos asociados a la categoría. */
  @ManyToMany(() => Producto, (producto) => producto.categorias)
  @JoinTable({
    name: 'categoria_producto',
    joinColumn: { name: 'categoria_id', referencedColumnName: 'categoria_id' },
    inverseJoinColumn: { name: 'producto_id', referencedColumnName: 'producto_id' }
  })
  productos: Producto[];
}