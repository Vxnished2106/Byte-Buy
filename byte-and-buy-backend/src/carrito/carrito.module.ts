import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Carrito } from './entities/carrito.entity';
import { CarritoItem } from './entities/carrito-item.entity';
import { Producto } from '../producto/entities/producto.entity';
import { CarritoService } from './carrito.service';

@Module({
  imports: [TypeOrmModule.forFeature([Carrito, CarritoItem, Producto])],
  providers: [CarritoService],
  exports: [CarritoService],
})
export class CarritoModule {}
