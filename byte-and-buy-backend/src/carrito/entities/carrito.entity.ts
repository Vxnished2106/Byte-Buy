import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { CarritoItem } from './carrito-item.entity';

@Entity('carrito')
export class Carrito {
  @PrimaryGeneratedColumn()
  carrito_id: number;

  // Un carrito por usuario (unique).
  @Column({ type: 'int', unique: true })
  usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => CarritoItem, (item) => item.carrito, { cascade: true })
  items: CarritoItem[];

  @CreateDateColumn()
  carrito_fecha_creacion: Date;

  @UpdateDateColumn()
  carrito_fecha_actualizacion: Date;
}
