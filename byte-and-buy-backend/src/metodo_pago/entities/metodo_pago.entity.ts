import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Pago } from '../../pago/entities/pago.entity';

@Entity('metodo_pago')
export class MetodoPago {
  @PrimaryGeneratedColumn()
  metodo_pago_id: number;

  @Column({ type: 'varchar', length: 100 })
  metodo_pago_nombre: string;

  @OneToMany(() => Pago, (pago) => pago.metodoPago)
  pagos: Pago[];
}
