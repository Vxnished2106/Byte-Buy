import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Función principal de arranque de la aplicación NestJS.
 * Configura CORS, pipes de validación global y arranca el servidor.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Por defecto refleja cualquier origen; si FRONTEND_URL está definida (la
  // URL del static site en Render), restringe el CORS a ese origen.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Render (y otros PaaS) inyectan PORT y exigen escuchar en 0.0.0.0; sin el
  // host, el deploy nunca detecta el puerto abierto y queda colgado hasta el
  // timeout.
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
