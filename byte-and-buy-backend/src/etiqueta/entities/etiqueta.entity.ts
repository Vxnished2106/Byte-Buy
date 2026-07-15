import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

@Entity('etiqueta')
export class Etiqueta {
  @PrimaryGeneratedColumn()
  etiqueta_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  etiqueta_nombre: string;

  @ManyToMany(() => Producto, (producto) => producto.etiquetas)
  @JoinTable({
    name: 'etiqueta_producto',
    joinColumn: { name: 'etiqueta_id', referencedColumnName: 'etiqueta_id' },
    inverseJoinColumn: { name: 'producto_id', referencedColumnName: 'producto_id' }
  })
  productos: Producto[];
}