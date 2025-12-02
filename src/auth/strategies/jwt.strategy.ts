import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioService } from '../../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usuarioService: UsuarioService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret-key-default-change-in-production',
    });
  }

  async validate(payload: any) {
    const { sub: userId } = payload;

    // Verificar que el usuario existe y está activo
    const usuario = await this.usuarioService.findOne(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo o suspendido');
    }

    // Retornar el usuario completo para que esté disponible en req.user
    return {
      id: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
      areaAsignada: usuario.areaAsignada,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      clienteId: usuario.clienteId?.toString(),
    };
  }
}
