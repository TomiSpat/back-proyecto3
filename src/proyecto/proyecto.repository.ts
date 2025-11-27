import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Proyecto, ProyectoDocument } from './entities/proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { IProyectoRepository } from './interface/IProyectoRepository';

@Injectable()
export class ProyectoRepository implements IProyectoRepository {
  constructor(
    @InjectModel(Proyecto.name) private proyectoModel: Model<ProyectoDocument>,
  ) {}

  async create(data: CreateProyectoDto): Promise<ProyectoDocument> {
    const proyecto = new this.proyectoModel({
      ...data,
      clienteId: new Types.ObjectId(data.clienteId),
      tipoProyectoId: new Types.ObjectId(data.tipoProyectoId),
    });
    return await proyecto.save();
  }

  async findAll(filter: any = {}): Promise<ProyectoDocument[]> {
    return await this.proyectoModel
      .find({ ...filter, isDeleted: false })
      .populate('clienteId')
      .populate('tipoProyectoId')
      .exec();
  }

  async findOne(id: string): Promise<ProyectoDocument | null> {
    return await this.proyectoModel
      .findOne({ _id: id, isDeleted: false })
      .populate('clienteId')
      .populate('tipoProyectoId')
      .exec();
  }

  async findBy(filter: any): Promise<ProyectoDocument[]> {
    return await this.proyectoModel
      .find({ ...filter, isDeleted: false })
      .populate('clienteId')
      .populate('tipoProyectoId')
      .exec();
  }

  async findByCliente(clienteId: string): Promise<ProyectoDocument[]> {
    return await this.proyectoModel
      .find({ clienteId: new Types.ObjectId(clienteId), isDeleted: false })
      .populate('clienteId')
      .populate('tipoProyectoId')
      .exec();
  }

  async findByTipoProyecto(tipoProyectoId: string): Promise<ProyectoDocument[]> {
    return await this.proyectoModel
      .find({ tipoProyectoId: new Types.ObjectId(tipoProyectoId), isDeleted: false })
      .populate('clienteId')
      .populate('tipoProyectoId')
      .exec();
  }

  async update(
    id: string,
    data: UpdateProyectoDto,
  ): Promise<ProyectoDocument | null> {
    const updateData: any = { ...data };
    if (data.clienteId) {
      updateData.clienteId = new Types.ObjectId(data.clienteId);
    }
    if (data.tipoProyectoId) {
      updateData.tipoProyectoId = new Types.ObjectId(data.tipoProyectoId);
    }
    
    return await this.proyectoModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .populate('clienteId')
      .populate('tipoProyectoId')
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.proyectoModel
      .findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
      })
      .exec();
  }
}
