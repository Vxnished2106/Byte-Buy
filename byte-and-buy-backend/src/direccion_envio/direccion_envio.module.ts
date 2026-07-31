import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionEnvio } from './entities/direccion_envio.entity';
import { Ciudad } from '../catalogo/entities/ciudad.entity';
import { DireccionEnvioService } from './direccion_envio.service';
import { DireccionEnvioController } from './direccion_envio.controller';
import { UsuarioModule } from '../usuario/usuario.module';

/**
 * Módulo de direcciones de envío.
 * Contiene la lógica para registrar y consultar las direcciones de los usuarios.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DireccionEnvio, Ciudad]),
    UsuarioModule,
  ],
  controllers: [DireccionEnvioController],
  providers: [DireccionEnvioService],
  exports: [DireccionEnvioService, TypeOrmModule],
})
export class DireccionEnvioModule {}
