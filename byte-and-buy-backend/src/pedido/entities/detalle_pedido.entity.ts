import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../producto/entities/producto.entity';

/**
 * Entidad de detalle de pedido (línea).
 *
 * Cada línea guarda los importes ya calculados por el servidor. Las CHECK
 * garantizan a nivel de esquema que la cantidad sea positiva, el precio no
 * negativo y el descuento esté en el rango 0–100 %. La restricción UNIQUE
 * (pedido, producto) impide líneas duplicadas del mismo producto.
 */
@Entity('detalle_pedido')
@Unique('UQ_detalle_pedido_producto', ['pedido_id', 'producto_id'])
@Check(`detalle_pedido_cantidad > 0`)
@Check(`detalle_pedido_precio_unitario >= 0`)
@Check(`detalle_pedido_descuento_pct >= 0 AND detalle_pedido_descuento_pct <= 100`)
@Check(`detalle_pedido_impuesto_pct >= 0`)
@Check(`detalle_pedido_subtotal >= 0`)
@Check(`detalle_pedido_total >= 0`)
export class DetallePedido {
  /** ID único del detalle de pedido. */
  @PrimaryGeneratedColumn()
  detalle_pedido_id: number;

  /** Cantidad del producto pedido (entera y positiva). */
  @Column({ type: 'int' })
  detalle_pedido_cantidad: number;

  /** Precio unitario del producto al momento del pedido. */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  detalle_pedido_precio_unitario: number;

  /** Porcentaje de descuento aplicado a la línea (0–100). */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  detalle_pedido_descuento_pct: number;

  /** Porcentaje de impuesto aplicado a la línea. */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  detalle_pedido_impuesto_pct: number;

  /** Subtotal de la línea (precio unitario × cantidad, antes de descuento). */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  detalle_pedido_subtotal: number;

  /** Monto de descuento de la línea. */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  detalle_pedido_descuento_monto: number;

  /** Monto de impuesto de la línea. */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  detalle_pedido_impuesto_monto: number;

  /** Total de la línea (subtotal − descuento + impuesto). */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  detalle_pedido_total: number;

  /** ID del pedido al que pertenece el detalle. */
  @Column({ type: 'int' })
  pedido_id: number;

  /** Pedido al que pertenece el detalle. */
  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  /** ID del producto pedido. */
  @Column({ type: 'int' })
  producto_id: number;

  /** Producto pedido. */
  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
