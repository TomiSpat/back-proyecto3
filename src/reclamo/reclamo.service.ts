import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { ReclamoRepository } from './reclamo.repository';
import { ReclamoDocument } from './entities/reclamo.entity';
import { AssignReclamoDto } from './dto/asignacion-area.dto';
import { AsignarReclamoPendienteDto } from './dto/asignar-reclamo-pendiente.dto';
import { UsuarioDocument } from '../usuario/entities/usuario.entity';
import { UsuarioRol } from '../usuario/usuario.enums';
import { ReclamoPrioridad, ReclamoCriticidad, ReclamoEstado } from './reclamo.enums';

@Injectable()
export class ReclamoService {
  constructor(private readonly reclamoRepository: ReclamoRepository) {}

  /**
   * Crea un reclamo con lógica diferenciada según el rol del usuario
   * - CLIENTE: Crea reclamo básico (sin área asignada, pendiente de asignación por coordinador)
   * - ADMIN/AGENTE/COORDINADOR: Crea reclamo completo con asignaciones
   */
  async create(createReclamoDto: CreateReclamoDto, usuario: UsuarioDocument): Promise<ReclamoDocument> {
    // Determinar el escenario según el rol del usuario
    const esCliente = usuario.rol === UsuarioRol.CLIENTE;
    const esStaff = [UsuarioRol.ADMIN, UsuarioRol.COORDINADOR, UsuarioRol.AGENTE].includes(usuario.rol);

    if (!esCliente && !esStaff) {
      throw new BadRequestException('El usuario no tiene un rol válido para crear reclamos');
    }

    try {
      let reclamoData: any;

      if (esCliente) {
        // ====== ESCENARIO 1: CLIENTE CREA SU PROPIO RECLAMO ======
        reclamoData = await this.prepararReclamoCliente(createReclamoDto, usuario);
      } else {
        // ====== ESCENARIO 2: STAFF (Admin/Agente/Coordinador) CREA RECLAMO ======
        reclamoData = await this.prepararReclamoStaff(createReclamoDto, usuario);
      }

      return await this.reclamoRepository.create(reclamoData);
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Ya existe un reclamo con ese código');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el reclamo: ${error.message}`);
    }
  }

  /**
   * Prepara los datos del reclamo cuando lo crea un CLIENTE
   */
  private async prepararReclamoCliente(createReclamoDto: CreateReclamoDto, usuario: UsuarioDocument): Promise<any> {
    // Validar que el cliente tenga un clienteId asociado
    if (!usuario.clienteId) {
      throw new BadRequestException(
        'El usuario cliente no tiene un cliente asociado. Contacte con soporte.'
      );
    }

    // El cliente NO puede especificar estos campos, se asignan automáticamente
    return {
      // Campos proporcionados por el cliente
      proyectoId: createReclamoDto.proyectoId,
      tipoProyectoId: createReclamoDto.tipoProyectoId,
      tipo: createReclamoDto.tipo,
      descripcion: createReclamoDto.descripcion,

      // Campos asignados automáticamente
      clienteId: usuario.clienteId.toString(), // Del usuario autenticado
      prioridad: ReclamoPrioridad.MEDIA, // Por defecto
      criticidad: ReclamoCriticidad.MEDIA, // Por defecto
      estadoActual: ReclamoEstado.PENDIENTE, // Pendiente de asignación
      areaActual: undefined, // Sin área asignada (el coordinador lo asignará)
      responsableActualId: undefined, // Sin responsable (el coordinador lo asignará)
      creadoPorUsuarioId: usuario._id.toString(),
    };
  }

  /**
   * Prepara los datos del reclamo cuando lo crea STAFF (Admin/Agente/Coordinador)
   */
  private async prepararReclamoStaff(createReclamoDto: CreateReclamoDto, usuario: UsuarioDocument): Promise<any> {
    // Validar que se proporcione el clienteId
    if (!createReclamoDto.clienteId) {
      throw new BadRequestException(
        'El campo clienteId es obligatorio cuando Admin/Agente/Coordinador crea un reclamo'
      );
    }

    // Validar que se proporcionen prioridad y criticidad
    if (!createReclamoDto.prioridad) {
      throw new BadRequestException(
        'El campo prioridad es obligatorio cuando Admin/Agente/Coordinador crea un reclamo'
      );
    }

    if (!createReclamoDto.criticidad) {
      throw new BadRequestException(
        'El campo criticidad es obligatorio cuando Admin/Agente/Coordinador crea un reclamo'
      );
    }

    // El staff puede crear reclamos con asignaciones inmediatas
    const estadoInicial = createReclamoDto.areaInicial && createReclamoDto.responsableId
      ? ReclamoEstado.EN_PROCESO
      : ReclamoEstado.PENDIENTE;

    return {
      // Campos proporcionados por el staff
      clienteId: createReclamoDto.clienteId,
      proyectoId: createReclamoDto.proyectoId,
      tipoProyectoId: createReclamoDto.tipoProyectoId,
      tipo: createReclamoDto.tipo,
      prioridad: createReclamoDto.prioridad,
      criticidad: createReclamoDto.criticidad,
      descripcion: createReclamoDto.descripcion,
      areaActual: createReclamoDto.areaInicial, // Puede ser asignada inmediatamente
      responsableActualId: createReclamoDto.responsableId, // Puede ser asignado inmediatamente

      // Campos del sistema
      estadoActual: estadoInicial,
      creadoPorUsuarioId: usuario._id.toString(),
    };
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

    // Verificar si el reclamo puede ser modificado
    const reclamoActual = await this.reclamoRepository.findOne(id);
    if (!reclamoActual) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo actualizar.`);
    }

    if (!reclamoActual.puedeModificar) {
      throw new ForbiddenException(
        `No se puede modificar el reclamo en estado ${reclamoActual.estadoActual}. ` +
        `Los reclamos en este estado no permiten modificaciones. ` +
        `Use el endpoint de cambio de estado si necesita cambiar el estado del reclamo.`
      );
    }

    try {
      const reclamo = await this.reclamoRepository.update(id, updateReclamoDto);
      if (!reclamo) {
        throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo actualizar.`);
      }
      return reclamo;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar el reclamo: ${error.message}`);
    }
  }

  async asignarArea(id: string, assignDto: AssignReclamoDto): Promise<ReclamoDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    // Verificar si el reclamo puede ser reasignado
    const reclamoActual = await this.reclamoRepository.findOne(id);
    if (!reclamoActual) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo asignar el área.`);
    }

    if (!reclamoActual.puedeReasignar) {
      throw new ForbiddenException(
        `No se puede reasignar el reclamo en estado ${reclamoActual.estadoActual}. ` +
        `Los reclamos en este estado no permiten reasignaciones.`
      );
    }

    const reclamo = await this.reclamoRepository.asignarArea(id, assignDto.area);
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo asignar el área.`);
    }

    // Si se proporciona un responsable, actualizarlo también
    if (assignDto.responsableId) {
      const actualizado = await this.reclamoRepository.update(id, { responsableActualId: assignDto.responsableId });
      if (!actualizado) {
        throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo asignar el responsable.`);
      }
      return actualizado;
    }

    return reclamo;
  }

  /**
   * Asigna un reclamo PENDIENTE a un área y responsable (usado por Coordinadores)
   * Este método actualiza el estado del reclamo de PENDIENTE a EN_PROCESO
   */
  async asignarReclamoPendiente(
    id: string, 
    asignarDto: AsignarReclamoPendienteDto,
    usuario: UsuarioDocument
  ): Promise<ReclamoDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    // Verificar que el usuario sea coordinador o admin
    if (![UsuarioRol.COORDINADOR, UsuarioRol.ADMIN].includes(usuario.rol)) {
      throw new ForbiddenException(
        'Solo los coordinadores y administradores pueden asignar reclamos pendientes'
      );
    }

    // Buscar el reclamo
    const reclamo = await this.reclamoRepository.findOne(id);
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}".`);
    }

    // Verificar que el reclamo esté en estado PENDIENTE
    if (reclamo.estadoActual !== ReclamoEstado.PENDIENTE) {
      throw new BadRequestException(
        `El reclamo ya ha sido asignado. Estado actual: ${reclamo.estadoActual}. ` +
        `Use el endpoint de reasignación si necesita cambiar el área o responsable.`
      );
    }

    // Verificar que el reclamo no tenga área asignada
    if (reclamo.areaActual) {
      throw new BadRequestException(
        `El reclamo ya tiene un área asignada: ${reclamo.areaActual}. ` +
        `Use el endpoint de reasignación para cambiarla.`
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      areaActual: asignarDto.area,
      estadoActual: ReclamoEstado.EN_PROCESO, // Cambiar a EN_PROCESO al asignar
    };

    if (asignarDto.responsableId) {
      updateData.responsableActualId = asignarDto.responsableId;
    }

    if (asignarDto.prioridad) {
      updateData.prioridad = asignarDto.prioridad;
    }

    if (asignarDto.criticidad) {
      updateData.criticidad = asignarDto.criticidad;
    }

    // Actualizar el reclamo
    const reclamoActualizado = await this.reclamoRepository.update(id, updateData);
    if (!reclamoActualizado) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}".`);
    }

    return reclamoActualizado;
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
