import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente, ClienteDocument } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { IClienteRepository } from './interface/IClienteRepository';

@Injectable()
export class ClienteRepository implements IClienteRepository {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<ClienteDocument>,
  ) {}

  async create(data: CreateClienteDto): Promise<ClienteDocument> {
    const cliente = new this.clienteModel(data);
    return await cliente.save();
  }

  async findAll(filter: any = {}): Promise<ClienteDocument[]> {
    return await this.clienteModel
      .find({ ...filter, isDeleted: false })
      .exec();
  }

  async findOne(id: string): Promise<ClienteDocument | null> {
    return await this.clienteModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
  }

  async findBy(filter: any): Promise<ClienteDocument[]> {
    return await this.clienteModel
      .find({ ...filter, isDeleted: false })
      .exec();
  }

  async update(
    id: string,
    data: UpdateClienteDto,
  ): Promise<ClienteDocument | null> {
    return await this.clienteModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.clienteModel
      .findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
      })
      .exec();
  }
}
