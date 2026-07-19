import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Carrito } from '../../carrito/entities/carrito.entity';
import { Pago } from '../../pago/entities/pago.entity';

@Entity('venta')
export class Venta {
  @PrimaryGeneratedColumn()
  venta_id: number;

  @CreateDateColumn()
  venta_fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  venta_monto: number;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  venta_estado: string;

  @Column({ type: 'int' })
  usuario_id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'int', nullable: true })
  carrito_id: number | null;

  @ManyToOne(() => Carrito, (carrito) => carrito.ventas, { nullable: true })
  @JoinColumn({ name: 'carrito_id' })
  carrito: Carrito | null;

  @OneToMany(() => Pago, (pago) => pago.venta)
  pagos: Pago[];
  
}
