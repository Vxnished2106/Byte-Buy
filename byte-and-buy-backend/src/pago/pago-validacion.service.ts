import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidarPagoDto } from './dto/validar-pago.dto';

export type MarcaTarjeta = 'visa' | 'mastercard' | 'amex';

export interface ResultadoValidacionPago {
  valido: boolean;
  marca: MarcaTarjeta;
  mensaje: string;
}

/**
 * Servicio de validación por método de pago. Valida los datos de una tarjeta
 * (número, marca, CVV y fecha de expiración) sin procesar el cobro; el cobro
 * real corresponde al módulo de pagos.
 */
@Injectable()
export class PagoValidacionService {
  validar(dto: ValidarPagoDto): ResultadoValidacionPago {
    const numero = dto.numero_tarjeta.replace(/[\s-]/g, '');

    if (!/^\d{13,19}$/.test(numero)) {
      throw new BadRequestException(
        'El número de tarjeta debe tener entre 13 y 19 dígitos',
      );
    }

    const marca = this.detectarMarca(numero);
    if (!marca) {
      throw new BadRequestException(
        'Marca de tarjeta no reconocida (se aceptan Visa, Mastercard y Amex)',
      );
    }

    if (!this.validarLuhn(numero)) {
      throw new BadRequestException('El número de tarjeta no es válido');
    }

    const longitudCvv = marca === 'amex' ? 4 : 3;
    if (!new RegExp(`^\\d{${longitudCvv}}$`).test(dto.cvv)) {
      throw new BadRequestException(
        `El CVV debe tener ${longitudCvv} dígitos para esta tarjeta`,
      );
    }

    if (this.estaVencida(dto.fecha_expiracion)) {
      throw new BadRequestException('La tarjeta está vencida');
    }

    return {
      valido: true,
      marca,
      mensaje: 'Método de pago válido',
    };
  }

  /** Algoritmo de Luhn para validar el dígito verificador de la tarjeta. */
  private validarLuhn(numero: string): boolean {
    let suma = 0;
    let alternar = false;

    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = Number(numero[i]);
      if (alternar) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
      alternar = !alternar;
    }

    return suma % 10 === 0;
  }

  /** Detecta la marca de la tarjeta a partir de su prefijo. */
  private detectarMarca(numero: string): MarcaTarjeta | null {
    if (/^4/.test(numero)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(numero)) return 'mastercard';
    if (/^3[47]/.test(numero)) return 'amex';
    return null;
  }

  /**
   * Determina si la tarjeta está vencida. La tarjeta es válida hasta el último
   * día del mes de expiración (formato MM/YY o MM/YYYY).
   */
  private estaVencida(fecha: string): boolean {
    const [mesStr, anioStr] = fecha.split('/');
    const mes = Number(mesStr);
    const anio = anioStr.length === 2 ? 2000 + Number(anioStr) : Number(anioStr);

    // new Date(anio, mes, 0) => último día del mes indicado (mes es 1-based aquí).
    const finDeVigencia = new Date(anio, mes, 0, 23, 59, 59, 999);
    return new Date() > finDeVigencia;
  }
}
