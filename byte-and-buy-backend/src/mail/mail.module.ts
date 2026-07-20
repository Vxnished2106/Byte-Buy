import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Módulo de correo electrónico.
 * Contiene la lógica para enviar correos electrónicos.
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
