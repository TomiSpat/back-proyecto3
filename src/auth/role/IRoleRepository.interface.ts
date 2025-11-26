import { DeleteResult } from 'typeorm';
import { RoleDto } from './dtos/role.dto';
import { RoleEntity } from './entities/role.entity';

// src/common/interfaces/irepository.interface.ts
export interface IRoleRepository {
  findAll(): Promise<RoleEntity[]>;
  findOneById(id: number): Promise<RoleEntity | null>;
  findOneByName(name: string): Promise<RoleEntity | null>;
  create(data: RoleDto): Promise<RoleEntity>;
  update(entity: RoleEntity): Promise<RoleEntity>;
  deleteById(id: number): Promise<DeleteResult>;
}
