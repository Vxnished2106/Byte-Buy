import { Module } from '@nestjs/common';

import { PagoController } from './pago.controller';
import { PagoValidacionService } from './pago-validacion.service';

@Module({
  controllers: [PagoController],
  providers: [PagoValidacionService],
  exports: [PagoValidacionService],
})
export class PagoModule {}
