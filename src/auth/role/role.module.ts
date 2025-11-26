import { Module, forwardRef } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { JwtModule } from '../jwt/jwt.module';
import { UsersModule } from 'src/auth/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { RoleProviders } from './role.providers';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity]),
    PermissionModule,
  ],
  controllers: [RoleController],
  providers: [
    RoleService,
    ...RoleProviders,
    // {
    //       provide: 'IRoleRepository',
    //       useClass: RoleRepository,
    //     },
    //     {
    //       provide: 'IPermissionRepository',
    //       useClass: PermissionRepository,
    //     },
  ],
  exports: [RoleService, ...RoleProviders],
})
export class RoleModule {}
