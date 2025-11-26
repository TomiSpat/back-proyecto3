import { HttpException, Injectable } from '@nestjs/common';
import { IPermissionRepository } from './IPermissionRepository.interface';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionDto } from './dtos/permission.dto';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repository: Repository<PermissionEntity>,
  ) {}

  findAll(): Promise<PermissionEntity[]> {
    return this.repository.find().catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  findOneById(id: number): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { id } }).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  create(data: PermissionDto): Promise<PermissionEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  update(id: number, nombreNuevoPermiso: string): Promise<PermissionEntity> {
    return this.repository
      .save({ id, nombre: nombreNuevoPermiso })
      .catch((err) => {
        throw new HttpException(err.message, err.status);
      });
  }

  deleteById(id: number): Promise<DeleteResult> {
    return this.repository.delete(id).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }
}
