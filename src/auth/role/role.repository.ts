import { HttpException, Injectable } from '@nestjs/common';
import { IRoleRepository } from './IRoleRepository.interface';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repository: Repository<RoleEntity>,
  ) {}

  findAll(): Promise<RoleEntity[]> {
    return this.repository.find().catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }
  findOneById(id: number): Promise<RoleEntity | null> {
    return this.repository
      .findOne({ where: { id }, relations: ['permissionCodes'] })
      .catch((err) => {
        throw new HttpException(err.message, err.status);
      });
  }

  findOneByName(name: string): Promise<RoleEntity | null> {
    return this.repository
      .findOne({ where: { name }, relations: ['permissionCodes'] })
      .catch((err) => {
        throw new HttpException(err.message, err.status);
      });
  }

  create(data: RoleEntity): Promise<RoleEntity> {
    const role = this.repository.create(data);
    return this.repository.save(role).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  update(entity: RoleEntity): Promise<RoleEntity> {
    return this.repository.save(entity).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  deleteById(id: number): Promise<DeleteResult> {
    return this.repository.delete(id).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }
}
