import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { PagoValidacionService } from './pago-validacion.service';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

@Controller('pagos')
@UseGuards(SupabaseAuthGuard)
export class PagoController {
  constructor(private readonly pagoValidacionService: PagoValidacionService) {}

  @Post('validar')
  validar(@Body() dto: ValidarPagoDto) {
    return this.pagoValidacionService.validar(dto);
  }
}
