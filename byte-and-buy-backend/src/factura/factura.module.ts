import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Venta } from '../venta/entities/venta.entity';
import { Pago } from '../pago/entities/pago.entity';
import { FacturaController } from './factura.controller';
import { FacturaService } from './factura.service';
import { PdfFacturaService } from './pdf-factura.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Factura,
      Venta,
      Pago,
    ]),
    MailModule,
  ],
  controllers: [FacturaController],
  providers: [
    FacturaService,
    PdfFacturaService,
  ],
  exports: [FacturaService],
})
export class FacturaModule {}