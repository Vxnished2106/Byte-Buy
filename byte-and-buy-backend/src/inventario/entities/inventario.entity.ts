import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Producto } from '../../producto/entities/producto.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';


@Entity('inventario')
export class Inventario {

  @PrimaryGeneratedColumn()
  inventario_id: number;


  @Column({ type: 'int', default: 0 })
  inventario_stock_actual: number;


  @Column({ type: 'int', default: 0 })
  inventario_stock_minimo: number;


  @CreateDateColumn()
  inventario_fecha_actualizacion: Date;



  @Column({ type: 'int', unique: true })
  producto_id: number;


  @OneToOne(
    () => Producto,
    (producto) => producto.inventario,
  )
  @JoinColumn({
    name: 'producto_id',
  })
  producto: Producto;

}