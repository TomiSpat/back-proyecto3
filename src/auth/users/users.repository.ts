import { HttpException, Injectable } from '@nestjs/common';
import { IUserRepository } from './iUsersRepository.interface';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDTO } from '../interfaces/register.dto';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  findAll(): Promise<UserEntity[]> {
    try {
      return this.repository.find();
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }

  findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ email }).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  findOneById(id: number): Promise<UserEntity | null> {
    return this.repository
      .findOne({ where: { id }, relations: ['role'] })
      .catch((err) => {
        throw new HttpException(err.message, err.status);
      });
  }

  create(data: RegisterDTO): Promise<UserEntity> {
    const user = this.repository.create(data);
    return this.repository.save(user).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }

  update(entity: UserEntity): Promise<UserEntity> {
    return this.repository.save(entity).catch((err) => {
      throw new HttpException(err.message, err.status);
    });
  }
}
