import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';
import { TipoProyectoRepository } from './tipo-proyecto.repository';
import { TipoProyectoDocument } from './entities/tipo-proyecto.entity';

@Injectable()
export class TipoProyectoService {
  constructor(private readonly tipoProyectoRepository: TipoProyectoRepository) {}

  async create(createTipoProyectoDto: CreateTipoProyectoDto): Promise<TipoProyectoDocument> {
    return await this.tipoProyectoRepository.create(createTipoProyectoDto);
  }

  async findAll(filter?: any): Promise<TipoProyectoDocument[]> {
    return await this.tipoProyectoRepository.findAll(filter);
  }

  async findOne(id: string): Promise<TipoProyectoDocument> {
    const tipoProyecto = await this.tipoProyectoRepository.findOne(id);
    if (!tipoProyecto) {
      throw new NotFoundException(`Tipo de Proyecto con ID ${id} no encontrado`);
    }
    return tipoProyecto;
  }

  async findBy(filter: any): Promise<TipoProyectoDocument[]> {
    return await this.tipoProyectoRepository.findBy(filter);
  }

  async update(
    id: string,
    updateTipoProyectoDto: UpdateTipoProyectoDto,
  ): Promise<TipoProyectoDocument> {
    const tipoProyecto = await this.tipoProyectoRepository.update(id, updateTipoProyectoDto);
    if (!tipoProyecto) {
      throw new NotFoundException(`Tipo de Proyecto con ID ${id} no encontrado`);
    }
    return tipoProyecto;
  }

  async softDelete(id: string): Promise<void> {
    const tipoProyecto = await this.tipoProyectoRepository.findOne(id);
    if (!tipoProyecto) {
      throw new NotFoundException(`Tipo de Proyecto con ID ${id} no encontrado`);
    }
    await this.tipoProyectoRepository.softDelete(id);
  }
}
