import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  categoria_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  categoria_nombre: string;

  @Column({ type: 'text', nullable: true })
  categoria_descripcion: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categoria_imagen: string | null;

  @ManyToMany(() => Producto, (producto) => producto.categorias)
  @JoinTable({
    name: 'categoria_producto',
    joinColumn: { name: 'categoria_id', referencedColumnName: 'categoria_id' },
    inverseJoinColumn: { name: 'producto_id', referencedColumnName: 'producto_id' }
  })
  productos: Producto[];
}