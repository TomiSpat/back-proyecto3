// import {
//   HttpException,
//   HttpStatus,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';

// //import { SetPermissionDto } from './dtos/setpermissions.dto';
// import { SetRoleDto } from './dtos/setrole.dto';
// import { UserEntity } from './entities/user.entity';
// import { JwtService } from '../jwt/jwt.service';
// import { PermissionEntity } from '../permission/entities/permission.entity';
// import { LoginDTO } from '../interfaces/login.dto';
// import { RoleEntity } from '../role/entities/role.entity';
// import { RegisterDTO } from '../interfaces/register.dto';
// import { hashSync, compareSync } from 'bcrypt';

// @Injectable()
// export class UsersService {
//   repository = UserEntity;
//   repositoryPermission = PermissionEntity;
//   repositoryRole = RoleEntity;

//   constructor(private jwtService: JwtService) { }

//   async refreshToken(refreshToken: string) {
//     return this.jwtService.refreshToken(refreshToken);
//   }

//   async canDo(user: UserEntity, permission: string) {
//     const permissionCodes: PermissionEntity[] = []

//     // user.permissionCodes.forEach(permissionCode => { //obtiene los permisos del usuario
//     //   permissionCodes.push(permissionCode)
//     // })

//     user.role.forEach(role => {
//       role.permissionCodes.forEach(perm => permissionCodes.push(perm)); //obtiene los permisos de los roles del usuario

//     });

//     const result = permissionCodes.some(permissionCode => permissionCode.name === permission); //comparacion de los permisos

//     if (!result) {
//       throw new UnauthorizedException();
//     }

//     return user.id;
//   }

//   async register(body: RegisterDTO) {
//     try {
//       const existing = await this.repository.findOneBy({ email: body.email });
//       if (existing) {
//         throw new HttpException('El correo ya estÃ¡ registrado', 400);
//       }
//       const user = new UserEntity();
//       Object.assign(user, body);
//       user.password = hashSync(user.password, 10);
//       const data = await this.repository.save(user);
//       return { status: 'created', idUser: data.id };
//     } catch (error) {
//       throw new HttpException(error.message ?? 'Error de creacion', error.status ?? 500);
//     }
//   }

//   async list(): Promise<UserEntity[]> {
//     try {
//       return await this.repository.find()
//     } catch (error) {
//       throw new HttpException(error.message ?? "Error al obtener los usuarios :(", error.status ?? 500)
//     }
//   }

//   async login(body: LoginDTO) {
//     const user = await this.findByEmail(body.email);
//     if (user == null) {
//       throw new UnauthorizedException();
//     }
//     const compareResult = compareSync(body.password, user.password);
//     if (!compareResult) {
//       throw new UnauthorizedException();
//     }
//     return {
//       accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
//       refreshToken: this.jwtService.generateToken({ email: user.email }, 'refresh',)
//       // expirationTime: 780000,
//     };
//   }

//   async findByEmail(email: string): Promise<UserEntity> {
//     const user = await this.repository.findOneBy({ email });
//     if (!user) {
//       throw new HttpException("Usuario no encontrado", 404);
//     }
//     return user;
//   }

//   async setRole(params: { id: number }, body: SetRoleDto): Promise<any> {
//     try {
//       const id = params.id
//       const user = await this.repository.findOne({ where: { id } })
//       if (!user) {
//         throw new HttpException("Usuario no encontrado", 404)
//       }

//       const role = await this.repositoryRole.findOne({ where: { id: body.id } })
//       if (!role) {
//         throw new HttpException("Rol no encontrado", 404)
//       }

//       if (!user.role) {
//         user.role = [];
//       }
//       user.role.push(role);
//       await this.repository.save(user);
//       return HttpStatus.OK

//     } catch (error) {
//       throw new HttpException(error.message, error.status)
//     }
//   }

//   async quitarRol(userId: number, roleId: number): Promise<any> {
//     try {
//       const user = await this.repository.findOne({ where: { id: userId }, relations: ['role'] });
//       if (!user) {
//         throw new HttpException("Usuario no encontrado", 404);
//       }

//       const role = await this.repositoryRole.findOne({ where: { id: roleId } });
//       if (!role) {
//         throw new HttpException("Rol no encontrado", 404);
//       }

//       if (!Array.isArray(user.role) || user.role.length === 0) {
//         throw new HttpException("El usuario no contiene roles", 404);
//       }

//       const hadRole = user.role.some(r => r.id === role.id);
//       if (!hadRole) {
//         throw new HttpException("El usuario no tiene este rol asignado", 400);
//       }

//       user.role = user.role.filter(r => r.id !== role.id);
//       await this.repository.save(user);

//       return HttpStatus.OK;

//     } catch (error) {
//       throw new HttpException(error.message || "Error interno", error.status || 500);
//     }
//   }

//   async eliminarUsuario(userId: number): Promise<any> {
//     try {
//       await this.repository.delete({ id: userId });

//       return HttpStatus.OK;

//     } catch (error) {
//       throw new HttpException(error.message || "Error interno", error.status || 500);
//     }
//   }
// }
// src/modules/users/users.service.ts
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { UserEntity } from './entities/user.entity';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { RegisterDTO } from '../interfaces/register.dto';
import { LoginDTO } from '../interfaces/login.dto';
import { SetRoleDto } from './dtos/setrole.dto';
import { IUserRepository } from './iUsersRepository.interface';
import { HashHelper } from 'src/common/helpers/hash.helper';
import { IRoleRepository } from '../role/IRoleRepository.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async refreshToken(refreshToken: string) {
    return this.jwtService.refreshToken(refreshToken);
  }

  async canDo(user: UserEntity, permission: string) {
    const permissionCodes: PermissionEntity[] = [];

    user.role.forEach((role) => {
      role.permissionCodes.forEach((perm) => permissionCodes.push(perm));
    });

    const result = permissionCodes.some(
      (permissionCode) => permissionCode.name === permission,
    );

    if (!result) throw new UnauthorizedException();

    return user.id;
  }

  async register(body: RegisterDTO) {
    try {
      const existing = await this.userRepository.findOneByEmail(body.email);
      if (existing)
        throw new HttpException('El correo ya estÃ¡ registrado', 400);

      body.password = HashHelper.hash(body.password);

      const data = await this.userRepository.create(body);
      return { status: 'created', idUser: data.id };
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Error de creaciÃ³n',
        error.status ?? 500,
      );
    }
  }

  async list(): Promise<UserEntity[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Error al obtener los usuarios',
        error.status ?? 500,
      );
    }
  }

  async login(body: LoginDTO) {
    const user = await this.findByEmail(body.email);
    if (!user) throw new UnauthorizedException();

    const valid = HashHelper.compare(body.password, user.password);
    if (!valid) throw new UnauthorizedException();

    return {
      accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
      refreshToken: this.jwtService.generateToken(
        { email: user.email },
        'refresh',
      ),
    };
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) throw new HttpException('Usuario no encontrado', 404);
    return user;
  }

  async setRole(params: { id: number }, body: SetRoleDto): Promise<any> {
    try {
      const user = await this.userRepository.findOneById(params.id);
      if (!user) throw new HttpException('Usuario no encontrado', 404);

      const role = await this.roleRepository.findOneById(body.id);
      if (!role) throw new HttpException('Rol no encontrado', 404);

      user.role = user.role ? [...user.role, role] : [role];
      await this.userRepository.update(user);
      return HttpStatus.OK;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async quitarRol(userId: number, roleId: number): Promise<any> {
    try {
      const user = await this.userRepository.findOneById(userId);

      if (!user) throw new HttpException('Usuario no encontrado', 404);

      const role = await this.roleRepository.findOneById(roleId);
      if (!role) throw new HttpException('Rol no encontrado', 404);

      if (!Array.isArray(user.role) || user.role.length === 0)
        throw new HttpException('El usuario no contiene roles', 404);

      const hadRole = user.role.some((r) => r.id === role.id);
      if (!hadRole)
        throw new HttpException('El usuario no tiene este rol asignado', 400);

      user.role = user.role.filter((r) => r.id !== role.id);
      await this.userRepository.update(user);
      return HttpStatus.OK;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error interno',
        error.status || 500,
      );
    }
  }

  async listarRolesPorUsuario(id: number): Promise<RoleEntity[]> {
    try {
      const usuario = await this.userRepository.findOneById(id);
      const rolesUsuario = usuario.role;
      return rolesUsuario;
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Error al obtener los roles del usuario',
        error.status ?? 500,
      );
    }
  }
}
