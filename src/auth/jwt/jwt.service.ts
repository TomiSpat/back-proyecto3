import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sign, verify, SignOptions, Algorithm } from 'jsonwebtoken';
import { Payload } from '../interfaces/payload';
import config from 'src/config';

type JwtStringValue = string | number;

@Injectable()
export class JwtService {
  private readonly algorithm = config().jwt.algorithm;

  generateToken(
    payload: { email: string },
    type: 'refresh' | 'auth' = 'auth',
  ): string {
    const secret =
      config().jwt[type === 'auth' ? 'secretAuth' : 'secretRefresh'];
    if (!secret) throw new Error(`JWT secret for ${type} token is not defined`);

    if (!this.algorithm || typeof this.algorithm !== 'string') {
      throw new Error('JWT algorithm is not properly configured');
    }
    const expiresIn = config().jwt[
      type === 'auth' ? 'accessTokenExpiration' : 'refreshTokenExpiration'
    ] as string;

    // Convert string numbers to actual numbers, keep as string otherwise
    const expiresInValue = /^\d+$/.test(expiresIn)
      ? parseInt(expiresIn, 10)
      : expiresIn;

    const options: SignOptions = {
      expiresIn: expiresInValue as any, // Type assertion needed due to jsonwebtoken types
      algorithm: this.algorithm as Algorithm,
    };
    return sign(payload, secret, options);
  }

  generateInvitedToken(
    payload: { eventId: number },
    type: 'refresh' | 'auth' = 'auth',
  ): string {
    const secret =
      config().jwt[type === 'auth' ? 'secretAuth' : 'secretRefresh'];
    if (!secret) throw new Error(`JWT secret for ${type} token is not defined`);

    if (!this.algorithm || typeof this.algorithm !== 'string') {
      throw new Error('JWT algorithm is not properly configured');
    }
    const expiresIn = config().jwt[
      type === 'auth' ? 'accessTokenExpiration' : 'refreshTokenExpiration'
    ] as string;

    // Convert string numbers to actual numbers, keep as string otherwise
    const expiresInValue = /^\d+$/.test(expiresIn)
      ? parseInt(expiresIn, 10)
      : expiresIn;

    const options: SignOptions = {
      expiresIn: expiresInValue as any, // Type assertion needed due to jsonwebtoken types
      algorithm: this.algorithm as Algorithm,
    };
    return sign(payload, secret, options);
  }

  refreshToken(refreshToken: string) {
    try {
      const secret = config().jwt.secretRefresh;
      if (!secret) {
        throw new Error('Refresh token secret is not configured');
      }
      const payload = verify(refreshToken, secret, {
        algorithms: [this.algorithm as Algorithm],
      }) as unknown as Payload;

      const currentTime = Math.floor(Date.now() / 1000);
      const timeToExpire = (payload.exp - currentTime) / 60;

      // if (payload.email) {
        const accessToken = this.generateToken({ email: payload.email });
        const refresh =
          timeToExpire < 20
            ? this.generateToken({ email: payload.email }, 'refresh')
            : undefined;
        return {
          accessToken,
          ...(refresh && { refreshToken: refresh }),
          expirationTime: refresh ? 780000 : undefined,
        };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invÃ¡lido o expirado');
    }
  }

  getPayload(token: string, type: 'refresh' | 'auth' = 'auth') {
    try {
      const secret =
        config().jwt[type === 'auth' ? 'secretAuth' : 'secretRefresh'];
      if (!secret) {
        throw new Error(`${type} token secret is not configured`);
      }
      return verify(token, secret, {
        algorithms: [this.algorithm as Algorithm],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Token invÃ¡lido';
      throw new UnauthorizedException(errorMessage);
    }
  }
}
