import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Pais } from './pais.entity';
import { Ciudad } from './ciudad.entity';

/**
 * Entidad de región (provincia/estado).
 * Pertenece a un país y agrupa ciudades.
 */
@Entity('region')
export class Region {
  /** ID único de la región. */
  @PrimaryGeneratedColumn()
  region_id: number;

  /** Nombre de la región. */
  @Column({ type: 'varchar', length: 100 })
  region_nombre: string;

  /** ID del país al que pertenece la región. */
  @Column({ type: 'int' })
  pais_id: number;

  /** País al que pertenece la región. */
  @ManyToOne(() => Pais, (pais) => pais.regiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pais_id' })
  pais: Pais;

  /** Ciudades pertenecientes a la región. */
  @OneToMany(() => Ciudad, (ciudad) => ciudad.region)
  ciudades: Ciudad[];
}
