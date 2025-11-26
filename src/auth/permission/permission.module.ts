import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionProviders } from './permission.providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  providers: [
    PermissionService,
    ...PermissionProviders,
    // {
    //   provide: 'IPermissionRepository',
    //   useClass: PermissionRepository,
    // },
  ],
  controllers: [PermissionController],
  exports: [PermissionService, ...PermissionProviders],
})
export class PermissionModule {}
