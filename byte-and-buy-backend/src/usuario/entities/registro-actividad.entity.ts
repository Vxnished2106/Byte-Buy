import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('registro_actividad')
export class RegistroActividad {
  @PrimaryGeneratedColumn()
  registro_id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo_actividad: string;

  @Column({ type: 'json' })
  campos_actualizados: any;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_modificacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.registrosActividad, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'int' })
  usuario_id: number;
}