// src/modules/role/mappers/role.mapper.ts
import { RoleEntity } from '../entities/role.entity';
import { RoleDto } from '../dtos/role.dto';

export class RoleMapper {
  static toEntity(dto: RoleDto): RoleEntity {
    const entity = new RoleEntity();
    entity.name = dto.name;
    return entity;
  }
}
