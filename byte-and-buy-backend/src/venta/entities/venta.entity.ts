import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Carrito } from '../../carrito/entities/carrito.entity';
import { Pago } from '../../pago/entities/pago.entity';
import { DetalleCompra } from '../../detalle_compra/entities/detalle_compra.entity';
import { Factura } from '../../factura/entities/factura.entity';

/**
 * Entidad de venta.
 * Representa una venta realizada por un usuario en la base de datos.
 */
@Entity('venta')
export class Venta {
  /** ID único de la venta. */
  @PrimaryGeneratedColumn()
  venta_id: number;

  /** Fecha en la que se registró la venta. */
  @CreateDateColumn()
  venta_fecha: Date;

  /** Monto total de la venta. */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  venta_monto: number;

  /** Estado actual de la venta (por defecto "pendiente"). */
  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  venta_estado: string;

  /** ID del usuario que realizó la venta. */
  @Column({ type: 'int' })
  usuario_id: number;

  /** Usuario que realizó la venta. */
  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** ID del carrito a partir del cual se generó la venta (opcional). */
  @Column({ type: 'int', nullable: true })
  carrito_id: number | null;

  /** Carrito a partir del cual se generó la venta (opcional). */
  @ManyToOne(() => Carrito, (carrito) => carrito.ventas, { nullable: true })
  @JoinColumn({ name: 'carrito_id' })
  carrito: Carrito | null;

  /** Pagos asociados a la venta. */
  @OneToMany(() => Pago, (pago) => pago.venta)
  pagos: Pago[];

  @OneToMany(() => DetalleCompra, (dc) => dc.venta, { cascade: true })
  detallesCompra: DetalleCompra[];

  @OneToMany(() => Factura, (factura) => factura.venta)
  facturas: Factura[];

}
