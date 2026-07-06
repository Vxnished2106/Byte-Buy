import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { TokenRecuperacionModule } from '../token_recuperacion/token_recuperacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    AuthModule,
    MailModule,
    TokenRecuperacionModule
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
