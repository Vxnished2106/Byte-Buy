/**
 * Módulo de entidades de método de pago
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Pago } from '../../pago/entities/pago.entity';

/**
 * Entidad que representa un método de pago
 */
@Entity('metodo_pago')
export class MetodoPago {
  /** Identificador único del método de pago */
  @PrimaryGeneratedColumn()
  metodo_pago_id: number;

  /** Nombre del método de pago */
  @Column({ type: 'varchar', length: 100 })
  metodo_pago_nombre: string;

  /** Pagos asociados a este método de pago */
  @OneToMany(() => Pago, (pago) => pago.metodoPago)
  pagos: Pago[];
}
