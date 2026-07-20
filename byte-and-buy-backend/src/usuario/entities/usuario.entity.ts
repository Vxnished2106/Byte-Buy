import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { TokenRecuperacion } from '../../token_recuperacion/entities/token_recuperacion.entity';
import { RegistroActividad } from './registro-actividad.entity';
import { Venta } from '../../venta/entities/venta.entity';

/**
 * Roles de usuario.
 */
export enum Rol {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
}

/**
 * Entidad de usuario.
 * Representa a un usuario en la base de datos.
 */
@Entity('usuarios')
export class Usuario {
  /** ID único del usuario. */
  @PrimaryGeneratedColumn()
  usuario_id: number;

  /** ID del usuario en Supabase. */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  supabase_id: string | null;

  /** Nombre del usuario. */
  @Column({ type: 'varchar', length: 100 })
  usuario_nombre: string;

  /** Primer apellido del usuario. */
  @Column({ type: 'varchar', length: 100 })
  usuario_apellido1: string;

  /** Segundo apellido del usuario (opcional). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_apellido2: string | null;

  /** Correo electrónico del usuario. */
  @Column({ type: 'varchar', length: 100, unique: true })
  usuario_correo: string;

  /** Contraseña del usuario (no seleccionada por defecto). */
  @Column({ type: 'varchar', length: 255, select: false })
  usuario_contrasena: string;

  /** Rol del usuario (cliente o admin). */
  @Column({ type: 'varchar', length: 50, default: Rol.CLIENTE })
  usuario_rol: Rol;

  /** URL de la foto de perfil del usuario (opcional). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  usuario_foto: string | null;

  /** Tokens de recuperación de contraseña asociados al usuario. */
  @OneToMany(() => TokenRecuperacion, (token) => token.usuario)
  tokensRecuperacion: TokenRecuperacion[];

  /** Registros de actividad del usuario. */
  @OneToMany(() => RegistroActividad, (registro) => registro.usuario)
  registrosActividad: RegistroActividad[];

  /** Ventas realizadas por el usuario. */
  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];
}
