import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Producto } from '../producto/entities/producto.entity';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { AuthController } from '../auth/auth.controller';
import { AuthModule } from '../auth/auth.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, Producto]),
    AuthModule,
    UsuarioModule
  ],
  controllers: [CategoriaController, AuthController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriaModule {}
