import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import config from 'src/config';
import { Request, Response } from 'express';
import { SetRoleDto } from './dtos/setrole.dto';
import { LoginDTO } from '../interfaces/login.dto';
import { RegisterDTO } from '../interfaces/register.dto';
import { UserEntity } from './entities/user.entity';
import { Permissions } from 'src/auth/permissions.enum';
import { AuthGuard, AuthGuardFactory } from 'src/middleware/auth.middleware';
import { RoleEntity } from '../role/entities/role.entity';
import { RequestWithUser } from '../interfaces/request-user';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post('register')
  register(@Body() body: RegisterDTO) {
    return this.service.register(body);
  }

  @UseGuards(AuthGuardFactory(Permissions.LISTAR_USUARIOS))
  @Get('')
  async list(): Promise<UserEntity[]> {
    return await this.service.list();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    const user = req.user;
    return {
      id: user.id,
      role: user.role,
    };
  }

  // @UseGuards(AuthGuard)
  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: config().cookies.httpOnly,
      secure: config().cookies.secure,
      sameSite: config().cookies.sameSite,
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: config().cookies.httpOnly,
      secure: config().cookies.secure,
      sameSite: config().cookies.sameSite,
      path: '/users/refresh-token',
    });
    return { message: 'Logout exitoso' };
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDTO,
  ) {
    const expirationTime = 13 * 60 * 1000; // 13 minutos
    const accessTokenExpiresAt = Date.now() + expirationTime;

    const { accessToken, refreshToken } = await this.service.login(body);

    res.cookie('access_token', accessToken, {
      httpOnly: config().cookies.httpOnly,
      secure: config().cookies.secure,
      sameSite: config().cookies.sameSite,
      maxAge: expirationTime,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: config().cookies.httpOnly,
      secure: config().cookies.secure,
      sameSite: config().cookies.sameSite,
      maxAge: 12 * 60 * 60 * 1000, // 12h
      path: '/users/refresh-token',
    });

    return {
      message: 'Login exitoso',
      accessTokenExpiresAt,
    };
  }

  @Get('refresh-token')
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No se proporcionÃ³ el refresh token');
    }

    const tokens = await this.service.refreshToken(refreshToken);

    if (tokens.accessToken) {
      response.cookie('access_token', tokens.accessToken, {
        httpOnly: config().cookies.httpOnly,
        secure: config().cookies.secure,
        sameSite: config().cookies.sameSite,
        maxAge: tokens.expirationTime || 780000,
        path: '/',
      });
    }

    if (tokens.refreshToken) {
      response.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: config().cookies.httpOnly,
        secure: config().cookies.secure,
        sameSite: config().cookies.sameSite,
        maxAge: 12 * 60 * 60 * 1000,
        path: '/users/refresh-token',
      });
    }

    const expirationTime = 13 * 60 * 1000;
    const accessTokenExpiresAt = Date.now() + expirationTime;

    return response.send({ accessTokenExpiresAt });
  }

  @HttpCode(200)
  @Post(':id/role')
  async setRole(
    @Body() body: SetRoleDto,
    @Param('id') id: number,
  ): Promise<any> {
    return await this.service.setRole({ id }, body);
  }

  @UseGuards(AuthGuardFactory(Permissions.QUITAR_ROL))
  @Delete(':userId/role/:roleId')
  async quitarRol(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.service.quitarRol(userId, roleId);
  }

  @HttpCode(200)
  @Get(':id/roles')
  async listarRolesPorUsuario(@Param('id') id: number): Promise<RoleEntity[]> {
    return await this.service.listarRolesPorUsuario(id);
  }
}
