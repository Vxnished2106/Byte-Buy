import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';
import { Producto } from '../../producto/entities/producto.entity';

@Entity('detalle_compra')
export class DetalleCompra {
  @PrimaryGeneratedColumn()
  detalle_compra_id: number;

  @Column({ type: 'int' })
  detalle_compra_cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  detalle_compra_precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  detalle_compra_descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  detalle_compra_impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  detalle_compra_subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  detalle_compra_total: number;

  @Column({ type: 'int' })
  venta_id: number;

  @ManyToOne(() => Venta, (venta) => venta.detallesCompra, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ type: 'int' })
  producto_id: number;

  @ManyToOne(() => Producto, (producto) => producto.detallesCompra)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
