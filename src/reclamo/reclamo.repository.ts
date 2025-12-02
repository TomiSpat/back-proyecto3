import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reclamo, ReclamoDocument } from './entities/reclamo.entity';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { IReclamoRepository } from './interface/IReclamoRepository';

@Injectable()
export class ReclamoRepository implements IReclamoRepository {
  constructor(
    @InjectModel(Reclamo.name) private reclamoModel: Model<ReclamoDocument>,
  ) {}

  async create(data: any): Promise<ReclamoDocument> {
    const reclamoData: any = {
      ...data,
      clienteId: new Types.ObjectId(data.clienteId),
      proyectoId: new Types.ObjectId(data.proyectoId),
      tipoProyectoId: new Types.ObjectId(data.tipoProyectoId),
      creadoPorUsuarioId: data.creadoPorUsuarioId ? new Types.ObjectId(data.creadoPorUsuarioId) : undefined,
    };

    // Solo convertir responsableActualId si está presente
    if (data.responsableActualId) {
      reclamoData.responsableActualId = new Types.ObjectId(data.responsableActualId);
    }

    const reclamo = new this.reclamoModel(reclamoData);
    return await reclamo.save();
  }

  async findAll(filter: any = {}): Promise<ReclamoDocument[]> {
    return await this.reclamoModel
      .find(filter)
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ReclamoDocument | null> {
    return await this.reclamoModel
      .findById(id)
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .exec();
  }

  async findBy(filter: any): Promise<ReclamoDocument[]> {
    return await this.reclamoModel
      .find(filter)
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCliente(clienteId: string): Promise<ReclamoDocument[]> {
    return await this.reclamoModel
      .find({ clienteId: new Types.ObjectId(clienteId) })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProyecto(proyectoId: string): Promise<ReclamoDocument[]> {
    return await this.reclamoModel
      .find({ proyectoId: new Types.ObjectId(proyectoId) })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTipoProyecto(tipoProyectoId: string): Promise<ReclamoDocument[]> {
    return await this.reclamoModel
      .find({ tipoProyectoId: new Types.ObjectId(tipoProyectoId) })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByArea(area: string): Promise<ReclamoDocument[]> {
    return await this.reclamoModel
      .find({ areaActual: area })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    data: UpdateReclamoDto,
  ): Promise<ReclamoDocument | null> {
    const updateData: any = { ...data };
    
    if (data.clienteId) {
      updateData.clienteId = new Types.ObjectId(data.clienteId);
    }
    if (data.proyectoId) {
      updateData.proyectoId = new Types.ObjectId(data.proyectoId);
    }
    if (data.tipoProyectoId) {
      updateData.tipoProyectoId = new Types.ObjectId(data.tipoProyectoId);
    }
    if (data.responsableActualId) {
      updateData.responsableActualId = new Types.ObjectId(data.responsableActualId);
    }
    
    return await this.reclamoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .exec();
  }

  async asignarArea(id: string, area: string): Promise<ReclamoDocument | null> {
    return await this.reclamoModel
      .findByIdAndUpdate(id, { areaActual: area }, { new: true })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .populate('creadoPorUsuarioId')
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.reclamoModel
      .findByIdAndUpdate(id, {
        estadoActual: 'CANCELADO',
        fechaCierre: new Date(),
      })
      .exec();
  }
}
