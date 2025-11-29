import { CreateReclamoDto } from '../dto/create-reclamo.dto';
import { UpdateReclamoDto } from '../dto/update-reclamo.dto';
import { ReclamoDocument } from '../entities/reclamo.entity';

export interface IReclamoRepository {
  create(data: CreateReclamoDto): Promise<ReclamoDocument>;
  findAll(filter?: any): Promise<ReclamoDocument[]>;
  findOne(id: string): Promise<ReclamoDocument | null>;
  findBy(filter: any): Promise<ReclamoDocument[]>;
  findByCliente(clienteId: string): Promise<ReclamoDocument[]>;
  findByProyecto(proyectoId: string): Promise<ReclamoDocument[]>;
  findByTipoProyecto(tipoProyectoId: string): Promise<ReclamoDocument[]>;
  findByArea(area: string): Promise<ReclamoDocument[]>;
  update(id: string, data: UpdateReclamoDto): Promise<ReclamoDocument | null>;
  asignarArea(id: string, area: string): Promise<ReclamoDocument | null>;
  softDelete(id: string): Promise<void>;
}
