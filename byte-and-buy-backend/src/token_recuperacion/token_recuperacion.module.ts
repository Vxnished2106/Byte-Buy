import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenRecuperacion } from './entities/token_recuperacion.entity';
import { TokenRecuperacionService } from './token_recuperacion.service';

/**
 * Módulo de tokens de recuperación.
 * Contiene la lógica para la gestión de tokens de recuperación de contraseña.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TokenRecuperacion]),
  ],
  providers: [TokenRecuperacionService],
  exports: [TokenRecuperacionService],
})
export class TokenRecuperacionModule {}
