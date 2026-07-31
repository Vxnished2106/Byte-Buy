import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais } from './entities/pais.entity';
import { Region } from './entities/region.entity';
import { Ciudad } from './entities/ciudad.entity';
import { CatalogoService } from './catalogo.service';
import { CatalogoController } from './catalogo.controller';

/**
 * Módulo de catálogos geográficos.
 * Agrupa los países, regiones y ciudades usados en las direcciones de envío.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Pais, Region, Ciudad])],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService, TypeOrmModule],
})
export class CatalogoModule {}
