import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

/**
 * Entidad de registro de actividad.
 * Almacena el historial de cambios realizados por los usuarios.
 */
@Entity('registro_actividad')
export class RegistroActividad {
  /** ID único del registro. */
  @PrimaryGeneratedColumn()
  registro_id: number;

  /** Tipo de actividad realizada. */
  @Column({ type: 'varchar', length: 50 })
  tipo_actividad: string;

  /** Campos que se actualizaron en la actividad. */
  @Column({ type: 'json' })
  campos_actualizados: any;

  /** Fecha y hora de la modificación. */
  @CreateDateColumn({ type: 'timestamp' })
  fecha_modificacion: Date;

  /** Usuario que realizó la actividad. */
  @ManyToOne(() => Usuario, (usuario) => usuario.registrosActividad, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** ID del usuario que realizó la actividad. */
  @Column({ type: 'int' })
  usuario_id: number;
}