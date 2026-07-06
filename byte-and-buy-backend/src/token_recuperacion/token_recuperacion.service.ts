import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TokenRecuperacion } from './entities/token_recuperacion.entity';
import { ResponseTokenRecuperacionDto } from './dto/response-token_recuperacion.dto';

@Injectable()
export class TokenRecuperacionService {
  constructor(
    @InjectRepository(TokenRecuperacion)
    private readonly tokenRepository: Repository<TokenRecuperacion>,
  ) {}

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

  private generarPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private calcularExpiracion(): Date {
    const expira = new Date();
    expira.setMinutes(expira.getMinutes() + 15);
    return expira;
  }

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

  async marcarComoUsado(token: TokenRecuperacion): Promise<void> {
    token.usado_en = new Date();
    await this.tokenRepository.save(token);

    await this.tokenRepository.update(
      { usuario_id: token.usuario_id, usado_en: IsNull() },
      { usado_en: new Date() },
    );
  }

  async findByPin(pin: string): Promise<ResponseTokenRecuperacionDto> {
    const token = await this.tokenRepository.findOne({
      where: { token: pin },
    });

    if (!token) throw new NotFoundException('PIN no encontrado');
    return this.toResponseDto(token);
  }
}
