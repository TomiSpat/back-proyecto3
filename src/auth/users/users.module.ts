// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { JwtService } from '../jwt/jwt.service';
import { UsersRepository } from './users.repository';
import { RoleRepository } from '../role/role.repository';
import { PermissionRepository } from '../permission/permission.repository';
import { UsersController } from './users.controller';
import { RoleModule } from '../role/role.module';
import { UserProviders } from './user.providers';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity]),
    RoleModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtService,
    ...UserProviders,
    // {
    //   provide: 'IUserRepository',
    //   useClass: UsersRepository,
    // },
    // {
    //   provide: 'IRoleRepository',
    //   useClass: RoleRepository,
    // },
  ],
  exports: [UsersService, ...UserProviders],
})
export class UsersModule {}
