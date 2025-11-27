import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { ReclamoRepository } from './reclamo.repository';
import { ReclamoDocument } from './entities/reclamo.entity';
import { AssignReclamoDto } from './dto/asignacion-area.dto';

@Injectable()
export class ReclamoService {
  constructor(private readonly reclamoRepository: ReclamoRepository) {}

  async create(createReclamoDto: CreateReclamoDto): Promise<ReclamoDocument> {
    try {
      return await this.reclamoRepository.create(createReclamoDto);
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Ya existe un reclamo con ese código');
      }
      throw new BadRequestException(`Error al crear el reclamo: ${error.message}`);
    }
  }

  async findAll(filter?: any): Promise<ReclamoDocument[]> {
    return await this.reclamoRepository.findAll(filter);
  }

  async findOne(id: string): Promise<ReclamoDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }
    
    const reclamo = await this.reclamoRepository.findOne(id);
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". Verifique que el ID sea correcto.`);
    }
    return reclamo;
  }

  async findBy(filter: any): Promise<ReclamoDocument[]> {
    return await this.reclamoRepository.findBy(filter);
  }

  async findByCliente(clienteId: string): Promise<ReclamoDocument[]> {
    if (!clienteId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID del cliente "${clienteId}" no es un ObjectId válido de MongoDB`);
    }
    return await this.reclamoRepository.findByCliente(clienteId);
  }

  async findByProyecto(proyectoId: string): Promise<ReclamoDocument[]> {
    if (!proyectoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID del proyecto "${proyectoId}" no es un ObjectId válido de MongoDB`);
    }
    return await this.reclamoRepository.findByProyecto(proyectoId);
  }

  async findByTipoProyecto(tipoProyectoId: string): Promise<ReclamoDocument[]> {
    if (!tipoProyectoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID del tipo de proyecto "${tipoProyectoId}" no es un ObjectId válido de MongoDB`);
    }
    return await this.reclamoRepository.findByTipoProyecto(tipoProyectoId);
  }

  async findByArea(area: string): Promise<ReclamoDocument[]> {
    return await this.reclamoRepository.findByArea(area);
  }

  async update(
    id: string,
    updateReclamoDto: UpdateReclamoDto,
  ): Promise<ReclamoDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    try {
      const reclamo = await this.reclamoRepository.update(id, updateReclamoDto);
      if (!reclamo) {
        throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo actualizar.`);
      }
      return reclamo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar el reclamo: ${error.message}`);
    }
  }

  async asignarArea(id: string, assignDto: AssignReclamoDto): Promise<ReclamoDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    const reclamo = await this.reclamoRepository.asignarArea(id, assignDto.area);
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo asignar el área.`);
    }

    // Si se proporciona un responsable, actualizarlo también
    if (assignDto.responsableId) {
      return await this.update(id, { responsableActualId: assignDto.responsableId });
    }

    return reclamo;
  }

  async softDelete(id: string): Promise<void> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    const reclamo = await this.reclamoRepository.findOne(id);
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo cancelar.`);
    }
    await this.reclamoRepository.softDelete(id);
  }
}
