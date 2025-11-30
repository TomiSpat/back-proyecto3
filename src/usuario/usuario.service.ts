import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioRepository } from './usuario.repository';
import { UsuarioDocument } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { UsuarioRol } from './usuario.enums';

@Injectable()
export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioDocument> {
    // Verificar si el email ya existe
    const existeUsuario = await this.usuarioRepository.findByEmail(createUsuarioDto.email);
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario con el email "${createUsuarioDto.email}"`);
    }

    // Validar que los agentes tengan área asignada
    if (createUsuarioDto.rol === UsuarioRol.AGENTE && !createUsuarioDto.areaAsignada) {
      throw new BadRequestException('Los usuarios con rol "agente" deben tener un área asignada');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    try {
      const usuario = await this.usuarioRepository.create({
        ...createUsuarioDto,
        password: hashedPassword,
      });
      return usuario;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw new BadRequestException(`Error al crear el usuario: ${error.message}`);
    }
  }

  async findAll(filter?: any): Promise<UsuarioDocument[]> {
    return await this.usuarioRepository.findAll(filter);
  }

  async findOne(id: string): Promise<UsuarioDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con ID "${id}"`);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con email "${email}"`);
    }
    return usuario;
  }

  async findByRol(rol: string): Promise<UsuarioDocument[]> {
    return await this.usuarioRepository.findByRol(rol);
  }

  async findByArea(area: string): Promise<UsuarioDocument[]> {
    return await this.usuarioRepository.findByArea(area);
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    // Si se actualiza el email, verificar que no exista
    if (updateUsuarioDto.email) {
      const existeUsuario = await this.usuarioRepository.findByEmail(updateUsuarioDto.email);
      if (existeUsuario && existeUsuario._id.toString() !== id) {
        throw new ConflictException(`Ya existe un usuario con el email "${updateUsuarioDto.email}"`);
      }
    }

    // Si se actualiza la contraseña, hashearla
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    const usuario = await this.usuarioRepository.update(id, updateUsuarioDto);
    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con ID "${id}"`);
    }
    return usuario;
  }

  async softDelete(id: string): Promise<void> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con ID "${id}"`);
    }

    await this.usuarioRepository.softDelete(id);
  }

  async validateUser(email: string, password: string): Promise<UsuarioDocument | null> {
    const usuario = await this.usuarioRepository.findByEmailWithPassword(email);
    if (!usuario) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return null;
    }

    return usuario;
  }

  async updateUltimoAcceso(id: string): Promise<void> {
    await this.usuarioRepository.updateUltimoAcceso(id);
  }
}
