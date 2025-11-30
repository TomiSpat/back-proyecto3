import { UsuarioDocument } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

export interface IUsuarioRepository {
  create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioDocument>;
  findAll(filter?: any): Promise<UsuarioDocument[]>;
  findOne(id: string): Promise<UsuarioDocument | null>;
  findByEmail(email: string): Promise<UsuarioDocument | null>;
  findByEmailWithPassword(email: string): Promise<UsuarioDocument | null>;
  findByRol(rol: string): Promise<UsuarioDocument[]>;
  findByArea(area: string): Promise<UsuarioDocument[]>;
  update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioDocument | null>;
  updateUltimoAcceso(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}
