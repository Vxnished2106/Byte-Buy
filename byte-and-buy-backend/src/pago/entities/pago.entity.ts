import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';
import { MetodoPago } from '../../metodo_pago/entities/metodo_pago.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  pago_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pago_monto: number;

  @CreateDateColumn()
  pago_fecha: Date;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  pago_estado: string;

  @Column({ type: 'json', nullable: true })
  pago_detalle: any | null;

  @Column({ type: 'int' })
  venta_id: number;

  @ManyToOne(() => Venta, (venta) => venta.pagos)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ type: 'int' })
  metodo_pago_id: number;

  @ManyToOne(() => MetodoPago, (mp) => mp.pagos)
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;

}
