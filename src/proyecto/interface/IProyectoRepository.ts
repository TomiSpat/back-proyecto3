import { CreateProyectoDto } from '../dto/create-proyecto.dto';
import { UpdateProyectoDto } from '../dto/update-proyecto.dto';
import { ProyectoDocument } from '../entities/proyecto.entity';

export interface IProyectoRepository {
  create(data: CreateProyectoDto): Promise<ProyectoDocument>;
  findAll(filter?: any): Promise<ProyectoDocument[]>;
  findOne(id: string): Promise<ProyectoDocument | null>;
  findBy(filter: any): Promise<ProyectoDocument[]>;
  findByCliente(clienteId: string): Promise<ProyectoDocument[]>;
  findByTipoProyecto(tipoProyectoId: string): Promise<ProyectoDocument[]>;
  update(id: string, data: UpdateProyectoDto): Promise<ProyectoDocument | null>;
  softDelete(id: string): Promise<void>;
}
