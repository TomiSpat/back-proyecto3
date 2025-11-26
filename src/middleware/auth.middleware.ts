//middeleware
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { JwtService } from 'src/auth/jwt/jwt.service';
import { UserEntity } from 'src/auth/users/entities/user.entity';
import { UsersService } from 'src/auth/users/users.service';

export function AuthGuardFactory(permissionCode: string): Type<CanActivate> {
  @Injectable()
  class AuthGuardWithPermission implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context
          .switchToHttp()
          .getRequest<Request & { user?: UserEntity }>();

        // 1) Token de cookie
        const token = request.cookies?.['access_token'];
        if (!token) {
          throw new UnauthorizedException('Token no proporcionado');
        }

        // 2) Decodificar y verificar
        let payload: JwtPayload;
        try {
          payload = this.jwtService.getPayload(token) as JwtPayload;
        } catch {
          throw new UnauthorizedException('Token invÃ¡lido o expirado');
        }

        // 3) Email en payload
        const email = (payload as any).email ?? (payload as any).mail;
        if (!email) {
          throw new UnauthorizedException('El token no contiene email');
        }

        // 4) Buscar user
        const user = await this.usersService.findByEmail(email);

        if (!user) {
          throw new UnauthorizedException(`Mail ${email} no encontrado`);
        }

        // 5) Chequear permiso + adjuntar al request
        if (user) {
          const can = await this.usersService
            .canDo(user, permissionCode)
            .catch(() => false);
          if (!can) {
            throw new UnauthorizedException(
              'No tenÃ©s permisos para esta acciÃ³n',
            );
          }
          request.user = user;
          return true;
        }

        // fallback (no deberÃ­a llegar)
        return false;
      } catch (err) {
        console.error('[AuthGuard] canActivate error:', err?.message ?? err);
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('No autorizado');
      }
    }
  }

  return mixin(AuthGuardWithPermission);
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserEntity }>();
    const token = request.cookies['access_token'];

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    const payload = this.jwtService.getPayload(token);

    // console.log("payload", payload);

    const user = await this.usersService.findByEmail(
      payload['email'] ?? payload['mail'],
    );
    if (user) {
      request.user = user;
      return true;
    }

    throw new UnauthorizedException();
  }
}
