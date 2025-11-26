import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionDto } from './dtos/permission.dto';
import { PermissionEntity } from './entities/permission.entity';

@Controller('permission')
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  // @Post('')
  async create(@Body() body: PermissionDto): Promise<PermissionEntity> {
    return await this.service.create(body);
  }

  // @Get('')
  async list(): Promise<PermissionEntity[]> {
    return await this.service.list();
  }

  // @Put(':id')
  async update(
    @Body() body: PermissionDto,
    @Param('id') id: number,
  ): Promise<PermissionEntity> {
    return await this.service.update({ id }, { permissionDto: body });
  }

  // @Delete(':id')
  async delete(@Param('id') id: number): Promise<string> {
    return await this.service.delete({ id });
  }
}
