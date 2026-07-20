/**
 * Módulo de métodos de pago
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoPago } from './entities/metodo_pago.entity';
import { MetodoPagoService } from './metodo_pago.service';
import { MetodoPagoController } from './metodo_pago.controller';

/**
 * Módulo que configura y exporta los componentes de métodos de pago
 */
@Module({
  imports: [TypeOrmModule.forFeature([MetodoPago])],
  controllers: [MetodoPagoController],
  providers: [MetodoPagoService],
  exports: [MetodoPagoService],
})
export class MetodoPagoModule {}
