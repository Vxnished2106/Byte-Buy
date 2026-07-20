import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

/**
 * Entidad de etiqueta.
 * Representa una etiqueta que puede asignarse a productos en la base de datos.
 */
@Entity('etiqueta')
export class Etiqueta {
  /** ID único de la etiqueta. */
  @PrimaryGeneratedColumn()
  etiqueta_id: number;

  /** Nombre de la etiqueta (único). */
  @Column({ type: 'varchar', length: 50, unique: true })
  etiqueta_nombre: string;

  /** Productos asociados a la etiqueta. */
  @ManyToMany(() => Producto, (producto) => producto.etiquetas)
  @JoinTable({
    name: 'etiqueta_producto',
    joinColumn: { name: 'etiqueta_id', referencedColumnName: 'etiqueta_id' },
    inverseJoinColumn: { name: 'producto_id', referencedColumnName: 'producto_id' }
  })
  productos: Producto[];
}
