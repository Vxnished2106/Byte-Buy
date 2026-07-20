import { Injectable } from '@nestjs/common';

/**
 * Servicio principal de la aplicación NestJS.
 * Contiene métodos de ejemplo y lógica básica.
 */
@Injectable()
export class AppService {
  /**
   * Método de ejemplo que retorna un saludo.
   * @returns Saludo en texto.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
