import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Usuario, Carrito]),
    UsuarioModule
  ],
  controllers: [VentaController],
  providers: [VentaService],
  exports: [VentaService],
})
export class VentaModule {}
