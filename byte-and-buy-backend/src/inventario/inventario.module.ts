/**
 * Módulo de inventarios
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { Producto } from '../producto/entities/producto.entity';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { UsuarioModule } from '../usuario/usuario.module';

/**
 * Módulo que configura y exporta los componentes de inventario
 */
@Module({
  imports: [TypeOrmModule.forFeature([Inventario, Producto]),
    UsuarioModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule { }
