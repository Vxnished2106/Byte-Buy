import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { TokenRecuperacion } from '../../token_recuperacion/entities/token_recuperacion.entity';
import { RegistroActividad } from './registro-actividad.entity';

export enum Rol {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  usuario_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  supabase_id: string | null;

  @Column({ type: 'varchar', length: 100 })
  usuario_nombre: string;

  @Column({ type: 'varchar', length: 100 })
  usuario_apellido1: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_apellido2: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  usuario_correo: string;

  @Column({ type: 'varchar', length: 255, select: false })
  usuario_contrasena: string;

  @Column({ type: 'varchar', length: 50, default: Rol.CLIENTE })
  usuario_rol: Rol;

  @Column({ type: 'varchar', length: 255, nullable: true })
  usuario_foto: string | null;

  @OneToMany(() => TokenRecuperacion, (token) => token.usuario)
  tokensRecuperacion: TokenRecuperacion[];

  @OneToMany(() => RegistroActividad, (registro) => registro.usuario)
  registrosActividad: RegistroActividad[];
}
