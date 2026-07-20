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

/**
 * Entidad de pago.
 * Representa el pago realizado para una venta en la base de datos.
 */
@Entity('pago')
export class Pago {
  /** ID único del pago. */
  @PrimaryGeneratedColumn()
  pago_id: number;

  /** Monto pagado. */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pago_monto: number;

  /** Fecha en la que se registró el pago. */
  @CreateDateColumn()
  pago_fecha: Date;

  /** Estado actual del pago (por defecto "pendiente"). */
  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  pago_estado: string;

  /** Detalle adicional del pago (opcional). */
  @Column({ type: 'json', nullable: true })
  pago_detalle: any | null;

  /** ID de la venta a la que corresponde el pago. */
  @Column({ type: 'int' })
  venta_id: number;

  /** Venta a la que corresponde el pago. */
  @ManyToOne(() => Venta, (venta) => venta.pagos)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  /** ID del método de pago utilizado. */
  @Column({ type: 'int' })
  metodo_pago_id: number;

  /** Método de pago utilizado. */
  @ManyToOne(() => MetodoPago, (mp) => mp.pagos)
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;

}
