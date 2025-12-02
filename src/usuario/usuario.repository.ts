import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { IUsuarioRepository } from './interface/IUsuarioRepository';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto | any): Promise<UsuarioDocument> {
    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
    });
    return await usuario.save();
  }

  async findAll(filter: any = {}): Promise<UsuarioDocument[]> {
    return await this.usuarioModel
      .find({ ...filter, isDeleted: false })
      .populate('clienteAsociadoId', 'nombre email')
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<UsuarioDocument | null> {
    return await this.usuarioModel
      .findOne({ _id: id, isDeleted: false })
      .populate('clienteAsociadoId', 'nombre email')
      .select('-password')
      .exec();
  }

  async findByEmail(email: string): Promise<UsuarioDocument | null> {
    return await this.usuarioModel
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .select('-password')
      .exec();
  }

  async findByEmailWithPassword(email: string): Promise<UsuarioDocument | null> {
    return await this.usuarioModel
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .select('+password')
      .exec();
  }

  async findByRol(rol: string): Promise<UsuarioDocument[]> {
    return await this.usuarioModel
      .find({ rol, isDeleted: false })
      .populate('clienteAsociadoId', 'nombre email')
      .select('-password')
      .sort({ nombre: 1 })
      .exec();
  }

  async findByArea(area: string): Promise<UsuarioDocument[]> {
    return await this.usuarioModel
      .find({ areaAsignada: area, isDeleted: false })
      .select('-password')
      .sort({ nombre: 1 })
      .exec();
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioDocument | null> {
    const updateData: any = { ...updateUsuarioDto };

    return await this.usuarioModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
      .populate('clienteAsociadoId', 'nombre email')
      .select('-password')
      .exec();
  }

  async updateUltimoAcceso(id: string): Promise<void> {
    await this.usuarioModel
      .findByIdAndUpdate(id, { ultimoAcceso: new Date() })
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.usuarioModel
      .findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
      })
      .exec();
  }
}
