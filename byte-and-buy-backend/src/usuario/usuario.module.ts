import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { RegistroActividad } from './entities/registro-actividad.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { AuthController } from '../auth/auth.controller';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { TokenRecuperacionModule } from '../token_recuperacion/token_recuperacion.module';

/**
 * Módulo de usuarios.
 * Contiene la lógica para la gestión de usuarios, autenticación y recuperación de contraseña.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, RegistroActividad]),
    AuthModule,
    MailModule,
    TokenRecuperacionModule
  ],
  controllers: [UsuarioController, AuthController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
