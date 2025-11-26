import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteRepository } from './cliente.repository';
import { ClienteDocument } from './entities/cliente.entity';

@Injectable()
export class ClienteService {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async create(createClienteDto: CreateClienteDto): Promise<ClienteDocument> {
    return await this.clienteRepository.create(createClienteDto);
  }

  async findAll(filter?: any): Promise<ClienteDocument[]> {
    return await this.clienteRepository.findAll(filter);
  }

  async findOne(id: string): Promise<ClienteDocument> {
    const cliente = await this.clienteRepository.findOne(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async findBy(filter: any): Promise<ClienteDocument[]> {
    return await this.clienteRepository.findBy(filter);
  }

  async update(
    id: string,
    updateClienteDto: UpdateClienteDto,
  ): Promise<ClienteDocument> {
    const cliente = await this.clienteRepository.update(id, updateClienteDto);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async softDelete(id: string): Promise<void> {
    const cliente = await this.clienteRepository.findOne(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    await this.clienteRepository.softDelete(id);
  }
}
