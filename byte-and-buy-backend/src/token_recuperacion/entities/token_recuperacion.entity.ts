import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('token_recuperacion')
export class TokenRecuperacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  usuario_id: number;

  @Column({ type: 'int', default: 0 })
  intentos: number;

  @Column({ type: 'varchar', length: 6 })
  token: string;

  @Column({ type: 'timestamp' })
  expira: Date;

  @Column({ type: 'timestamp', nullable: true })
  usado_en: Date | null;

  @CreateDateColumn()
  registro: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.tokensRecuperacion)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
