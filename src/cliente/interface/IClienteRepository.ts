import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';
import { ClienteDocument } from '../entities/cliente.entity';

export interface IClienteRepository {
  create(data: CreateClienteDto): Promise<ClienteDocument>;
  findAll(filter?: any): Promise<ClienteDocument[]>;
  findOne(id: string): Promise<ClienteDocument | null>;
  findBy(filter: any): Promise<ClienteDocument[]>;
  update(id: string, data: UpdateClienteDto): Promise<ClienteDocument | null>;
  softDelete(id: string): Promise<void>;
}
