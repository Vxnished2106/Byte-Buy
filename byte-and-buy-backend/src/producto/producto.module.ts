import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { CategoriaModule } from '../categoria/categoria.module';
import { EtiquetaModule } from '../etiqueta/etiqueta.module';
import { AuthModule } from '../auth/auth.module';
import { InventarioModule } from '../inventario/inventario.module';
import { Inventario } from '../inventario/entities/inventario.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Inventario]),
    CategoriaModule,
    EtiquetaModule,
    AuthModule,
    UsuarioModule
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService],
})
export class ProductoModule {}
