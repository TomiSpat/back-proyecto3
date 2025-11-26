import { DeleteResult } from 'typeorm';
import { PermissionDto } from './dtos/permission.dto';
import { PermissionEntity } from './entities/permission.entity';

// src/common/interfaces/irepository.interface.ts
export interface IPermissionRepository {
  findAll(): Promise<PermissionEntity[]>;
  findOneById(id: number): Promise<PermissionEntity | null>;
  create(data: PermissionDto): Promise<PermissionEntity>;
  update(id: number, nombreNuevoPermiso: string): Promise<PermissionEntity>;
  deleteById(id: number): Promise<DeleteResult>;
}
