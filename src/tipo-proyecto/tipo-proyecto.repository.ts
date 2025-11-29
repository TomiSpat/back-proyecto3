import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipoProyecto, TipoProyectoDocument } from './entities/tipo-proyecto.entity';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';
import { ITipoProyectoRepository } from './interface/ITipoProyectoRepository';

@Injectable()
export class TipoProyectoRepository implements ITipoProyectoRepository {
  constructor(
    @InjectModel(TipoProyecto.name) private tipoProyectoModel: Model<TipoProyectoDocument>,
  ) {}

  async create(data: CreateTipoProyectoDto): Promise<TipoProyectoDocument> {
    const tipoProyecto = new this.tipoProyectoModel(data);
    return await tipoProyecto.save();
  }

  async findAll(filter: any = {}): Promise<TipoProyectoDocument[]> {
    return await this.tipoProyectoModel
      .find({ ...filter, isDeleted: false })
      .exec();
  }

  async findOne(id: string): Promise<TipoProyectoDocument | null> {
    return await this.tipoProyectoModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
  }

  async findBy(filter: any): Promise<TipoProyectoDocument[]> {
    return await this.tipoProyectoModel
      .find({ ...filter, isDeleted: false })
      .exec();
  }

  async update(
    id: string,
    data: UpdateTipoProyectoDto,
  ): Promise<TipoProyectoDocument | null> {
    return await this.tipoProyectoModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.tipoProyectoModel
      .findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
      })
      .exec();
  }
}
