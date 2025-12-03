import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioRepository } from './usuario.repository';
import { UsuarioDocument } from './entities/usuario.entity';
import { ClienteRepository } from '../cliente/cliente.repository';
import * as bcrypt from 'bcrypt';
import { UsuarioRol } from './usuario.enums';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly clienteRepository: ClienteRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioDocument> {
    // Verificar si el email ya existe en usuarios
    const existeUsuario = await this.usuarioRepository.findByEmail(createUsuarioDto.email);
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario con el email "${createUsuarioDto.email}"`);
    }

    // Validar que los agentes tengan área asignada
    if (createUsuarioDto.rol === UsuarioRol.AGENTE && !createUsuarioDto.areaAsignada) {
      throw new BadRequestException('Los usuarios con rol "agente" deben tener un área asignada');
    }

    // Validar que los clientes tengan los datos necesarios
    if (createUsuarioDto.rol === UsuarioRol.CLIENTE) {
      if (!createUsuarioDto.numDocumento || !createUsuarioDto.fechaNacimiento || !createUsuarioDto.numTelefono) {
        throw new BadRequestException(
          'Los usuarios con rol "cliente" deben proporcionar: numDocumento, fechaNacimiento y numTelefono'
        );
      }
    }

    // Si es rol CLIENTE, usar transacción para crear Usuario y Cliente
    if (createUsuarioDto.rol === UsuarioRol.CLIENTE) {
      return await this.createUsuarioConCliente(createUsuarioDto);
    }

    // Para otros roles (admin, coordinador, agente), crear solo el usuario
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

  private async createUsuarioConCliente(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioDocument> {
    const session: ClientSession = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Verificar si ya existe un cliente con ese email
      const clienteExistente = await this.clienteRepository.findByEmail(createUsuarioDto.email);

      let clienteId: string;

      if (clienteExistente) {
        // Si el cliente ya existe, verificar que no tenga un usuario asociado
        if (clienteExistente.usuarioId) {
          throw new ConflictException(
            `El cliente con email "${createUsuarioDto.email}" ya tiene un usuario asociado`
          );
        }
        clienteId = clienteExistente._id.toString();
      } else {
        // 2. Crear el cliente si no existe
        const nuevoCliente = await this.clienteRepository.create({
          nombre: createUsuarioDto.nombre,
          apellido: createUsuarioDto.apellido,
          email: createUsuarioDto.email,
          numDocumento: createUsuarioDto.numDocumento!,
          fechaNacimiento: createUsuarioDto.fechaNacimiento!,
          numTelefono: createUsuarioDto.numTelefono!,
        });
        clienteId = nuevoCliente._id.toString();
      }

      // 3. Hashear la contraseña
      const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

      // 4. Crear el usuario con referencia al cliente
      const usuario = await this.usuarioRepository.create({
        nombre: createUsuarioDto.nombre,
        apellido: createUsuarioDto.apellido,
        email: createUsuarioDto.email,
        password: hashedPassword,
        rol: createUsuarioDto.rol,
        clienteId: clienteId as any,
      });

      // 5. Actualizar el cliente con la referencia al usuario
      await this.clienteRepository.updateUsuarioId(clienteId, usuario._id.toString());

      // Commit de la transacción
      await session.commitTransaction();

      return usuario;
    } catch (error) {
      // Rollback en caso de error
      await session.abortTransaction();

      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      if (error.code === 11000) {
        throw new ConflictException('Ya existe un usuario o cliente con ese email o documento');
      }

      throw new BadRequestException(`Error al crear el usuario con cliente: ${error.message}`);
    } finally {
      session.endSession();
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

  /**
   * Obtiene solo los agentes activos de un área específica
   * Útil para asignar responsables a reclamos
   */
  async findAgentesActivosByArea(area: string): Promise<UsuarioDocument[]> {
    return await this.usuarioRepository.findAgentesActivosByArea(area);
  }

  /**
   * Valida que un usuario sea un agente activo del área especificada
   */
  async validarAgenteDelArea(usuarioId: string, area: string): Promise<boolean> {
    if (!usuarioId.match(/^[0-9a-fA-F]{24}$/)) {
      return false;
    }

    const usuario = await this.usuarioRepository.findOne(usuarioId);
    if (!usuario) {
      return false;
    }

    return (
      usuario.rol === UsuarioRol.AGENTE &&
      usuario.areaAsignada === area &&
      usuario.estado === 'activo' &&
      !usuario.isDeleted
    );
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
