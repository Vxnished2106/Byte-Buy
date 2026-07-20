import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get<DataSource>(getDataSourceToken());

  console.log('Limpiando base de datos...');
  
  // Borrar tablas en orden (debido a relaciones)
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
  await dataSource.query('DROP TABLE IF EXISTS producto_proveedor;');
  await dataSource.query('DROP TABLE IF EXISTS inventario;');
  await dataSource.query('DROP TABLE IF EXISTS producto_etiqueta;');
  await dataSource.query('DROP TABLE IF EXISTS producto_categoria;');
  await dataSource.query('DROP TABLE IF EXISTS producto;');
  await dataSource.query('DROP TABLE IF EXISTS categoria;');
  await dataSource.query('DROP TABLE IF EXISTS etiqueta;');
  await dataSource.query('DROP TABLE IF EXISTS proveedor;');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('Base de datos limpiada correctamente!');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error al limpiar la base de datos:', err);
  process.exit(1);
});