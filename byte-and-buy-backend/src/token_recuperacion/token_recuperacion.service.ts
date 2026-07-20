import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TokenRecuperacion } from './entities/token_recuperacion.entity';
import { ResponseTokenRecuperacionDto } from './dto/response-token_recuperacion.dto';

/**
 * Servicio de tokens de recuperación.
 * Contiene la lógica para la gestión de tokens de recuperación de contraseña.
 */
@Injectable()
export class TokenRecuperacionService {
  constructor(
    @InjectRepository(TokenRecuperacion)
    private readonly tokenRepository: Repository<TokenRecuperacion>,
  ) {}

  /**
   * Convierte una entidad TokenRecuperacion a su DTO de respuesta.
   * @param token Entidad TokenRecuperacion.
   * @returns DTO de respuesta.
   */
  private toResponseDto(token: TokenRecuperacion): ResponseTokenRecuperacionDto {
    return {
      id: token.id,
      usuario_id: token.usuario_id,
      expira: token.expira,
      usado_en: token.usado_en,
      registro: token.registro,
      token: token.token
    };
  }

  /**
   * Genera un PIN aleatorio de 6 dígitos.
   * @returns PIN aleatorio.
   */
  private generarPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calcula la fecha de expiración del token (15 minutos a partir de ahora).
   * @returns Fecha de expiración.
   */
  private calcularExpiracion(): Date {
    const expira = new Date();
    expira.setMinutes(expira.getMinutes() + 15);
    return expira;
  }

  /**
   * Crea un nuevo token de recuperación para un usuario.
   * @param usuarioId ID del usuario.
   * @returns DTO del token creado.
   */
  async create(usuarioId: number): Promise<ResponseTokenRecuperacionDto> {
    await this.tokenRepository.update(
      { usuario_id: usuarioId, usado_en: IsNull() },
      { usado_en: new Date() },
    );

    const token = this.tokenRepository.create({
      usuario_id: usuarioId,
      token: this.generarPin(),
      expira: this.calcularExpiracion(),
      intentos: 0,
    });

    const guardado = await this.tokenRepository.save(token);
    return this.toResponseDto(guardado);
  }

  /**
   * Valida un PIN de recuperación.
   * @param pin PIN a validar.
   * @param usuarioId ID del usuario.
   * @returns Entidad TokenRecuperacion si el PIN es válido.
   * @throws BadRequestException Si el PIN es incorrecto, expiró o hay demasiados intentos.
   */
  async validarPin(pin: string, usuarioId: number): Promise<TokenRecuperacion> {
    const token = await this.tokenRepository.findOne({
      where: {
        token: pin,
        usuario_id: usuarioId,
        usado_en: IsNull(),
      },
      order: { registro: 'DESC' },
    });

    if (!token) throw new BadRequestException('PIN incorrecto');

    if (token.intentos >= 5) {
      throw new BadRequestException('Demasiados intentos, solicita un nuevo código');
    }

    token.intentos++;
    await this.tokenRepository.save(token);

    if (new Date() > token.expira) {
      throw new BadRequestException('El PIN ha expirado');
    }

    return token;
  }

  /**
   * Marca un token como usado.
   * @param token Token a marcar.
   */
  async marcarComoUsado(token: TokenRecuperacion): Promise<void> {
    token.usado_en = new Date();
    await this.tokenRepository.save(token);

    await this.tokenRepository.update(
      { usuario_id: token.usuario_id, usado_en: IsNull() },
      { usado_en: new Date() },
    );
  }

  /**
   * Busca un token por su PIN.
   * @param pin PIN del token.
   * @returns DTO del token.
   * @throws NotFoundException Si el token no existe.
   */
  async findByPin(pin: string): Promise<ResponseTokenRecuperacionDto> {
    const token = await this.tokenRepository.findOne({
      where: { token: pin },
    });

    if (!token) throw new NotFoundException('PIN no encontrado');
    return this.toResponseDto(token);
  }
}
