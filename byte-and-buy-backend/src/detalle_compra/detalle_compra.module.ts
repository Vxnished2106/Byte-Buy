import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle_compra.entity';
import { DetalleCompraService } from './detalle_compra.service';
import { DetalleCompraController } from './detalle_compra.controller';
import { ProductoModule } from '../producto/producto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleCompra]),
    ProductoModule,
  ],
  controllers: [DetalleCompraController],
  providers: [DetalleCompraService],
  exports: [DetalleCompraService],
})
export class DetalleCompraModule {}