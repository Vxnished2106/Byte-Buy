import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { PedidoEstado } from './pedido.entity';

/**
 * Entidad de historial de estado de un pedido.
 *
 * Registra cada transición: estado anterior, estado nuevo, quién la hizo,
 * cuándo y una nota opcional. Permite reconstruir la trazabilidad completa del
 * pedido (auditoría). El estado anterior es nulo en el registro de creación.
 */
@Entity('pedido_historial_estado')
@Index(['pedido_id'])
export class PedidoHistorialEstado {
  /** ID único del registro de historial. */
  @PrimaryGeneratedColumn()
  historial_id: number;

  /** ID del pedido al que pertenece el registro. */
  @Column({ type: 'int' })
  pedido_id: number;

  /** Pedido al que pertenece el registro. */
  @ManyToOne(() => Pedido, (pedido) => pedido.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  /** Estado antes de la transición (nulo en la creación). */
  @Column({ type: 'varchar', length: 30, nullable: true })
  estado_anterior: PedidoEstado | null;

  /** Estado después de la transición. */
  @Column({ type: 'varchar', length: 30 })
  estado_nuevo: PedidoEstado;

  /** ID del usuario que realizó el cambio (auditoría). */
  @Column({ type: 'int', nullable: true })
  usuario_id: number | null;

  /** Usuario que realizó el cambio. */
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  /** Nota opcional asociada al cambio de estado. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  historial_nota: string | null;

  /** Fecha del cambio de estado. */
  @CreateDateColumn()
  created_at: Date;
}
