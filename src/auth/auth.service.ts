import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from '../usuario/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validar credenciales
    const usuario = await this.usuarioService.validateUser(email, password);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo o suspendido');
    }

    // Actualizar último acceso
    await this.usuarioService.updateUltimoAcceso(usuario._id.toString());

    // Generar token JWT
    const payload = {
      sub: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
      areaAsignada: usuario.areaAsignada,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        areaAsignada: usuario.areaAsignada,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
