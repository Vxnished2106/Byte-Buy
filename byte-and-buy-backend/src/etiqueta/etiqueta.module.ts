import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etiqueta } from './entities/etiqueta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { EtiquetaService } from './etiqueta.service';
import { EtiquetaController } from './etiqueta.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Etiqueta, Producto]),
    UsuarioModule],
  controllers: [EtiquetaController],
  providers: [EtiquetaService],
  exports: [EtiquetaService],
})
export class EtiquetaModule { }
