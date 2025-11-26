import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RoleDto } from './dtos/role.dto';
import { RoleService } from './role.service';
import { SetPermissionDto } from './dtos/setPermission.dto';
import { RoleEntity } from './entities/role.entity';

@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  // @Post('')
  async create(@Body() body: RoleDto): Promise<RoleEntity> {
    return await this.service.create(body);
  }

  // @Get('')
  async list(): Promise<RoleEntity[]> {
    return await this.service.list();
  }

  // @Put(':id')
  async update(
    @Body() body: RoleDto,
    @Param('id') id: number,
  ): Promise<RoleEntity> {
    return await this.service.update({ id }, { roleDto: body });
  }

  // @Delete(':id')
  async delete(@Param('id') id: number): Promise<string> {
    return await this.service.delete({ id });
  }

  // @Post(':id/permissions')
  async setPermissions(
    @Body() body: SetPermissionDto,
    @Param('id') id: number,
  ): Promise<RoleEntity> {
    return await this.service.setPermission({ id }, body);
  }

  //   @HttpCode(200)
  // //   @Get('/user/:id')
  //   async listarRolesPorUsuario(
  //     @Param('id') id: number
  //   ): Promise<RoleEntity[]> {
  //     return await this.service.listarRolesPorUsuario(id)
  //   }
}
