import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, createRemoteJWKSet, decodeProtectedHeader } from 'jose';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwks: any;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) throw new Error('SUPABASE_URL not found');
    const jwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    this.jwks = createRemoteJWKSet(jwksUrl);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No Token Provided!');
    }

    const token = authHeader.split(' ')[1];

    try {
      const header = decodeProtectedHeader(token);
      const alg = header.alg;

      let payload: any;

      if (alg === 'ES256') {
        const result = await jwtVerify(token, this.jwks, {
          algorithms: ['ES256'],
        });
        payload = result.payload;
      } else {
        const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
        if (!jwtSecret) throw new UnauthorizedException('JWT Secret not found');
        const secret = new TextEncoder().encode(jwtSecret);
        const result = await jwtVerify(token, secret, {
          algorithms: ['HS256'],
        });
        payload = result.payload;
      }

      const userMetadata = (payload.user_metadata as any) || {};

      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        nombre: userMetadata.nombre || userMetadata.full_name || '',
        apellido: userMetadata.apellido || '',
        foto: userMetadata.foto || userMetadata.avatar_url || null,
        ...payload,
      };

      return true;
    } catch (error: any) {
      if (error?.code === 'ERR_JWT_EXPIRED') {
        throw new UnauthorizedException('Token Expired');
      }

      if (error?.name === 'JWTInvalid') {
        throw new UnauthorizedException('Invalid Token');
      }

      console.error('Unexpected JWT Error:', error);

      throw new UnauthorizedException('Invalid Token');
    }
  }
}
