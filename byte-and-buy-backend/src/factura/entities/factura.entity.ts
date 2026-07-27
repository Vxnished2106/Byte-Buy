import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';
import { Pago } from '../../pago/entities/pago.entity';

@Entity('factura')
export class Factura {
  @PrimaryGeneratedColumn()
  factura_id: number;

  @Column({ type: 'varchar', length: 100 })
  factura_numero: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  factura_monto_total: number;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  factura_estado: string;

  @CreateDateColumn()
  factura_fecha_creada: Date;

  @Column({ type: 'timestamp', nullable: true })
  factura_fecha_enviada: Date | null;

  @Column({ type: 'boolean', default: false })
  factura_enviada: boolean;

  @Column({ type: 'int' })
  venta_id: number;

  @ManyToOne(() => Venta, (venta) => venta.facturas)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ type: 'int' })
  pago_id: number;

  @ManyToOne(() => Pago, (pago) => pago.facturas)
  @JoinColumn({ name: 'pago_id' })
  pago: Pago;
}
