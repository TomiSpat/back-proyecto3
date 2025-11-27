import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectoRepository } from './proyecto.repository';
import { ProyectoDocument } from './entities/proyecto.entity';

@Injectable()
export class ProyectoService {
  constructor(private readonly proyectoRepository: ProyectoRepository) {}

  async create(createProyectoDto: CreateProyectoDto): Promise<ProyectoDocument> {
    return await this.proyectoRepository.create(createProyectoDto);
  }

  async findAll(filter?: any): Promise<ProyectoDocument[]> {
    return await this.proyectoRepository.findAll(filter);
  }

  async findOne(id: string): Promise<ProyectoDocument> {
    const proyecto = await this.proyectoRepository.findOne(id);
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    return proyecto;
  }

  async findBy(filter: any): Promise<ProyectoDocument[]> {
    return await this.proyectoRepository.findBy(filter);
  }

  async findByCliente(clienteId: string): Promise<ProyectoDocument[]> {
    return await this.proyectoRepository.findByCliente(clienteId);
  }

  async findByTipoProyecto(tipoProyectoId: string): Promise<ProyectoDocument[]> {
    return await this.proyectoRepository.findByTipoProyecto(tipoProyectoId);
  }

  async update(
    id: string,
    updateProyectoDto: UpdateProyectoDto,
  ): Promise<ProyectoDocument> {
    const proyecto = await this.proyectoRepository.update(id, updateProyectoDto);
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    return proyecto;
  }

  async softDelete(id: string): Promise<void> {
    const proyecto = await this.proyectoRepository.findOne(id);
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    await this.proyectoRepository.softDelete(id);
  }
}
