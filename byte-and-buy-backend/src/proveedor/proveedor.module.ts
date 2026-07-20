import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { UsuarioModule } from '../usuario/usuario.module';

/**
 * Módulo de proveedores.
 * Contiene la lógica para la gestión de proveedores de productos.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Proveedor]),
    UsuarioModule],
  controllers: [ProveedorController],
  providers: [ProveedorService],
  exports: [ProveedorService],
})
export class ProveedorModule { }
