import { create } from 'domain';
import { UserEntity } from './entities/user.entity';
import { RegisterDTO } from '../interfaces/register.dto';

// src/common/interfaces/irepository.interface.ts
export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findOneByEmail(email: string): Promise<UserEntity | null>;
  findOneById(id: number): Promise<UserEntity | null>;
  create(data: RegisterDTO): Promise<UserEntity>;
  update(entity: UserEntity): Promise<UserEntity>;
  // delete(filter: Partial<UserEntity>): Promise<void>;
}
