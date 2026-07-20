/**
 * Módulo de carrito de compras
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Carrito } from './entities/carrito.entity';
import { CarritoItem } from './entities/carrito-item.entity';
import { Producto } from '../producto/entities/producto.entity';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { InventarioModule } from '../inventario/inventario.module';
import { UsuarioModule } from '../usuario/usuario.module';

/**
 * Módulo que configura y exporta los componentes del carrito de compras
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Carrito, CarritoItem, Producto]),
    InventarioModule,
    UsuarioModule,
  ],
  controllers: [CarritoController],
  providers: [CarritoService],
  exports: [CarritoService],
})
export class CarritoModule {}
