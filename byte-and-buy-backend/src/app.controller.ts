import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controlador principal de la aplicación NestJS.
 * Maneja las rutas base.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Ruta GET base que retorna un saludo.
   * @returns Saludo en texto.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
