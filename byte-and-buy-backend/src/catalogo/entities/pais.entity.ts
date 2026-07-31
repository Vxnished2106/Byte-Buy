import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Region } from './region.entity';

/**
 * Entidad de país.
 * Catálogo de países disponibles para las direcciones de envío.
 */
@Entity('pais')
export class Pais {
  /** ID único del país. */
  @PrimaryGeneratedColumn()
  pais_id: number;

  /** Nombre del país. */
  @Column({ type: 'varchar', length: 100 })
  pais_nombre: string;

  /** Código ISO del país (ej. "CR", "MX"). */
  @Column({ type: 'varchar', length: 3, nullable: true })
  pais_codigo: string | null;

  /** Regiones pertenecientes al país. */
  @OneToMany(() => Region, (region) => region.pais)
  regiones: Region[];
}
