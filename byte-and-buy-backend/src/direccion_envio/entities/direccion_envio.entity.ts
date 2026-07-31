import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Ciudad } from '../../catalogo/entities/ciudad.entity';

/**
 * Entidad de dirección de envío.
 * Representa una dirección donde un usuario puede recibir sus pedidos.
 */
@Entity('direccion_envio')
export class DireccionEnvio {
  /** ID único de la dirección de envío. */
  @PrimaryGeneratedColumn()
  direccion_envio_id: number;

  /** ID del usuario dueño de la dirección. */
  @Column({ type: 'int' })
  usuario_id: number;

  /** Usuario dueño de la dirección. */
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /** ID de la ciudad de la dirección. */
  @Column({ type: 'int' })
  ciudad_id: number;

  /** Ciudad de la dirección. */
  @ManyToOne(() => Ciudad)
  @JoinColumn({ name: 'ciudad_id' })
  ciudad: Ciudad;

  /** Nombre de quien recibe el pedido. */
  @Column({ type: 'varchar', length: 150 })
  direccion_destinatario: string;

  /** Teléfono de contacto para la entrega. */
  @Column({ type: 'varchar', length: 20 })
  direccion_telefono: string;

  /** Calle y número de la dirección. */
  @Column({ type: 'varchar', length: 255 })
  direccion_calle: string;

  /** Referencia adicional para ubicar la dirección (opcional). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion_referencia: string | null;

  /** Código postal (opcional). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  direccion_codigo_postal: string | null;

  /** Fecha en la que se registró la dirección. */
  @CreateDateColumn()
  direccion_fecha_creacion: Date;
}
