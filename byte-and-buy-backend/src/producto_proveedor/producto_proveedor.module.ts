import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoProveedor } from './entities/producto_proveedor.entity';
import { ProductoProveedorService } from './producto-proveedor.service';
import { ProductoProveedorController } from './producto_proveedor.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoProveedor]),
    UsuarioModule],
  controllers: [ProductoProveedorController],
  providers: [ProductoProveedorService],
  exports: [ProductoProveedorService],
})
export class ProductoProveedorModule { }
