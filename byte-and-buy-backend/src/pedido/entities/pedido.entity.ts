import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Check,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { DireccionEnvio } from '../../direccion_envio/entities/direccion_envio.entity';
import { DetallePedido } from './detalle_pedido.entity';
import { PedidoHistorialEstado } from './pedido_historial_estado.entity';

/**
 * Estados posibles de un pedido y su máquina de transiciones.
 *
 * Flujo feliz: BORRADOR → CONFIRMADO → EN_PREPARACION → ENTREGADO.
 * CANCELADO es alcanzable desde BORRADOR, CONFIRMADO y EN_PREPARACION.
 * ENTREGADO y CANCELADO son estados terminales.
 */
export enum PedidoEstado {
  BORRADOR = 'BORRADOR',
  CONFIRMADO = 'CONFIRMADO',
  EN_PREPARACION = 'EN_PREPARACION',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Transiciones de estado permitidas. La clave es el estado origen y el valor
 * el conjunto de estados destino válidos. Es la única fuente de verdad de la
 * máquina de estados; el servicio la consulta antes de cualquier cambio.
 */
export const TRANSICIONES_PEDIDO: Readonly<
  Record<PedidoEstado, readonly PedidoEstado[]>
> = {
  [PedidoEstado.BORRADOR]: [PedidoEstado.CONFIRMADO, PedidoEstado.CANCELADO],
  [PedidoEstado.CONFIRMADO]: [
    PedidoEstado.EN_PREPARACION,
    PedidoEstado.CANCELADO,
  ],
  [PedidoEstado.EN_PREPARACION]: [
    PedidoEstado.ENTREGADO,
    PedidoEstado.CANCELADO,
  ],
  [PedidoEstado.ENTREGADO]: [],
  [PedidoEstado.CANCELADO]: [],
};

/**
 * Entidad de pedido (cabecera).
 *
 * Los importes se guardan desglosados (subtotal, descuento, impuesto, total) y
 * son siempre recalculados por el servidor: nunca se confía en los totales que
 * envía el cliente. La integridad se refuerza a nivel de esquema con CHECK
 * (importes no negativos), índices para el listado y unicidad del número de
 * pedido y de la clave de idempotencia.
 */
@Entity('pedido')
@Index(['pedido_estado'])
@Index(['cliente_id'])
@Index(['pedido_fecha'])
@Check(`pedido_subtotal >= 0`)
@Check(`pedido_descuento_total >= 0`)
@Check(`pedido_impuesto_total >= 0`)
@Check(`pedido_total >= 0`)
export class Pedido {
  /** ID único del pedido. */
  @PrimaryGeneratedColumn()
  pedido_id: number;

  /**
   * Número de pedido legible y único (ej. "PED-000042").
   * Lo asigna el servicio al crear; sirve de identificador de negocio.
   */
  @Column({ type: 'varchar', length: 20, unique: true })
  pedido_numero: string;

  /** Fecha de negocio del pedido (editable, distinta de created_at). */
  @Column({ type: 'datetime' })
  pedido_fecha: Date;

  /** Notas opcionales de la cabecera del pedido. */
  @Column({ type: 'text', nullable: true })
  pedido_notas: string | null;

  /** Estado actual del pedido (por defecto BORRADOR). */
  @Column({ type: 'varchar', length: 30, default: PedidoEstado.BORRADOR })
  pedido_estado: PedidoEstado;

  /** Suma de los subtotales de línea (antes de descuentos e impuestos). */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pedido_subtotal: number;

  /** Suma de los descuentos de línea. */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pedido_descuento_total: number;

  /** Suma de los impuestos de línea. */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pedido_impuesto_total: number;

  /** Monto total del pedido (subtotal − descuento + impuesto). */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pedido_total: number;

  /** ID del usuario cliente para quien es el pedido. */
  @Column({ type: 'int' })
  cliente_id: number;

  /** Usuario cliente del pedido. */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  /** ID de la dirección de envío (requerida al confirmar, opcional en BORRADOR). */
  @Column({ type: 'int', nullable: true })
  direccion_envio_id: number | null;

  /** Dirección de envío del pedido. */
  @ManyToOne(() => DireccionEnvio, { nullable: true })
  @JoinColumn({ name: 'direccion_envio_id' })
  direccionEnvio: DireccionEnvio | null;

  /**
   * Clave de idempotencia opcional. Si se repite una creación con la misma
   * clave (doble click, reintento de red) se devuelve el pedido ya creado en
   * vez de duplicarlo. Única cuando está presente.
   */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  pedido_idempotency_key: string | null;

  /** Versión para control de concurrencia optimista (la incrementa TypeORM). */
  @VersionColumn()
  pedido_version: number;

  /** ID del usuario que creó el pedido (auditoría). */
  @Column({ type: 'int', nullable: true })
  created_by: number | null;

  /** ID del usuario que modificó el pedido por última vez (auditoría). */
  @Column({ type: 'int', nullable: true })
  updated_by: number | null;

  /** Fecha de creación del registro. */
  @CreateDateColumn()
  created_at: Date;

  /** Fecha de última modificación del registro. */
  @UpdateDateColumn()
  updated_at: Date;

  /** Líneas de detalle del pedido. */
  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: DetallePedido[];

  /** Historial de cambios de estado del pedido. */
  @OneToMany(() => PedidoHistorialEstado, (h) => h.pedido, { cascade: true })
  historial: PedidoHistorialEstado[];
}
