import { Module } from '@nestjs/common';
import { Pago } from './entities/pago.entity';
import { Venta } from '../venta/entities/venta.entity';
import { MetodoPago } from '../metodo_pago/entities/metodo_pago.entity';
import { PagoController } from './pago.controller';
import { PagoValidacionService } from './pago-validacion.service';
import { PagoService } from './pago.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Venta, MetodoPago])],
  controllers: [PagoController],
  providers: [PagoValidacionService, PagoService],
  exports: [PagoValidacionService, PagoService],
})
export class PagoModule { }
