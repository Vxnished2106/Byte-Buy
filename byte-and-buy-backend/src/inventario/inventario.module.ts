import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { Producto } from '../producto/entities/producto.entity';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { ProveedorModule } from '../proveedor/proveedor.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario, Producto]),
    UsuarioModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule { }
