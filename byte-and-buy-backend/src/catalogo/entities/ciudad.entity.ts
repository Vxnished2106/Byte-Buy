import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Region } from './region.entity';

/**
 * Entidad de ciudad.
 * Pertenece a una región y es el nivel más específico del catálogo geográfico.
 */
@Entity('ciudad')
export class Ciudad {
  /** ID único de la ciudad. */
  @PrimaryGeneratedColumn()
  ciudad_id: number;

  /** Nombre de la ciudad. */
  @Column({ type: 'varchar', length: 100 })
  ciudad_nombre: string;

  /** ID de la región a la que pertenece la ciudad. */
  @Column({ type: 'int' })
  region_id: number;

  /** Región a la que pertenece la ciudad. */
  @ManyToOne(() => Region, (region) => region.ciudades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;
}
