import { CreateTipoProyectoDto } from '../dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from '../dto/update-tipo-proyecto.dto';
import { TipoProyectoDocument } from '../entities/tipo-proyecto.entity';

export interface ITipoProyectoRepository {
  create(data: CreateTipoProyectoDto): Promise<TipoProyectoDocument>;
  findAll(filter?: any): Promise<TipoProyectoDocument[]>;
  findOne(id: string): Promise<TipoProyectoDocument | null>;
  findBy(filter: any): Promise<TipoProyectoDocument[]>;
  update(id: string, data: UpdateTipoProyectoDto): Promise<TipoProyectoDocument | null>;
  softDelete(id: string): Promise<void>;
}
