// src/modules/role/pipes/validate-role.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { RoleDto } from '../dtos/role.dto';

export class ValidateRolePipe implements PipeTransform {
  transform(value: RoleDto) {
    if (!value.name) {
      throw new BadRequestException('El nombre del rol es obligatorio');
    }
    return value;
  }
}
