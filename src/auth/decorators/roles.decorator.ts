import { SetMetadata } from '@nestjs/common';
import { UsuarioRol } from '../../usuario/usuario.enums';

export const Roles = (...roles: UsuarioRol[]) => SetMetadata('roles', roles);
