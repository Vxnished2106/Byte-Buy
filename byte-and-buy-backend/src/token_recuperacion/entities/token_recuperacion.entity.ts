import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

/**
 * Entidad de token de recuperación.
 * Representa un token de recuperación de contraseña en la base de datos.
 */
@Entity('token_recuperacion')
export class TokenRecuperacion {
  /** ID único del token. */
  @PrimaryGeneratedColumn()
  id: number;

  /** ID del usuario asociado al token. */
  @Column({ type: 'int' })
  usuario_id: number;

  /** Número de intentos de validación del token. */
  @Column({ type: 'int', default: 0 })
  intentos: number;

  /** PIN del token. */
  @Column({ type: 'varchar', length: 6 })
  token: string;

  /** Fecha y hora de expiración del token. */
  @Column({ type: 'timestamp' })
  expira: Date;

  /** Fecha y hora en que se usó el token (null si no se ha usado). */
  @Column({ type: 'timestamp', nullable: true })
  usado_en: Date | null;

  /** Fecha y hora de creación del token. */
  @CreateDateColumn()
  registro: Date;

  /** Usuario asociado al token. */
  @ManyToOne(() => Usuario, (usuario) => usuario.tokensRecuperacion)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
