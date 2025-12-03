import { Injectable, NotFoundException, BadRequestException, ForbiddenException, forwardRef, Inject, HttpException } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { ReclamoRepository } from './reclamo.repository';
import { ReclamoDocument } from './entities/reclamo.entity';
import { AssignReclamoDto } from './dto/asignacion-area.dto';
import { AsignarReclamoPendienteDto } from './dto/asignar-reclamo-pendiente.dto';
import { AsignarResponsableDto } from './dto/asignar-responsable.dto';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UsuarioRol } from '../usuario/usuario.enums';
import { ReclamoPrioridad, ReclamoCriticidad, ReclamoEstado, AreaGeneralReclamo } from './reclamo.enums';
import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';
import { UsuarioService } from '../usuario/usuario.service';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { ReclamoMapper, ReclamoListDto } from './interface/reclamo.mapper';

@Injectable()
export class ReclamoService {
  constructor(
    private readonly reclamoRepository: ReclamoRepository,
    @Inject(forwardRef(() => EstadoReclamoService))
    private readonly estadoReclamoService: EstadoReclamoService,
    @Inject(forwardRef(() => UsuarioService))
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * - CLIENTE: Crea reclamo básico (sin área asignada, pendiente de asignación por coordinador)
   * - ADMIN/AGENTE/COORDINADOR: Crea reclamo completo con asignaciones
   */
  async create(createReclamoDto: CreateReclamoDto, usuario: JwtUser): Promise<ReclamoDocument> {
    // Determinar el escenario según el rol del usuario
    const esCliente = usuario.rol === UsuarioRol.CLIENTE;
    const esStaff = [UsuarioRol.ADMIN, UsuarioRol.COORDINADOR, UsuarioRol.AGENTE].includes(usuario.rol as UsuarioRol);

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
      if (error instanceof HttpException) {
        throw error;
      }
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
  private async prepararReclamoCliente(createReclamoDto: CreateReclamoDto, usuario: JwtUser): Promise<any> {
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
      clienteId: usuario.clienteId, // Del usuario autenticado
      prioridad: ReclamoPrioridad.MEDIA, // Por defecto
      criticidad: ReclamoCriticidad.MEDIA, // Por defecto
      estadoActual: ReclamoEstado.PENDIENTE, // Pendiente de asignación
      areaActual: undefined, // Sin área asignada (el coordinador lo asignará)
      responsableActualId: undefined, // Sin responsable (el coordinador lo asignará)
      creadoPorUsuarioId: usuario.id,
    };
  }

  /**
   * Prepara los datos del reclamo cuando lo crea STAFF (Admin/Agente/Coordinador)
   */
  private async prepararReclamoStaff(createReclamoDto: CreateReclamoDto, usuario: JwtUser): Promise<any> {
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
      creadoPorUsuarioId: usuario.id,
    };
  }

  async findAll(filter?: any): Promise<ReclamoDocument[]> {
    return await this.reclamoRepository.findAll(filter);
  }

  async findAllSimplified(filter?: any): Promise<ReclamoListDto[]> {
    const reclamos = await this.reclamoRepository.findAllWithRelations(filter);
    return ReclamoMapper.toListDtoArray(reclamos);
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    filter: any = {},
  ): Promise<PaginatedResponse<ReclamoDocument>> {
    return await this.reclamoRepository.findAllPaginated(filter, page, limit);
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

  async findByClientePaginated(
    clienteId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<ReclamoDocument>> {
    if (!clienteId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID del cliente "${clienteId}" no es un ObjectId válido de MongoDB`);
    }
    return await this.reclamoRepository.findByClientePaginated(clienteId, page, limit);
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

    // Validar que el responsable sea un agente activo del área nueva
    const esAgenteDelArea = await this.usuarioService.validarAgenteDelArea(
      assignDto.responsableId,
      assignDto.area
    );

    if (!esAgenteDelArea) {
      // Obtener agentes disponibles para mostrar en el mensaje de error
      const agentesDisponibles = await this.usuarioService.findAgentesActivosByArea(assignDto.area);
      const nombresAgentes = agentesDisponibles.map(a => `${a.nombre} ${a.apellido} (${a._id})`).join(', ');
      
      throw new BadRequestException(
        `El responsable seleccionado no es un agente activo del área "${assignDto.area}". ` +
        `Solo puede asignar agentes activos que pertenezcan a esta área. ` +
        `Agentes disponibles: ${nombresAgentes || 'No hay agentes activos en esta área'}`
      );
    }

    const areaAnterior = reclamoActual.areaActual;
    const responsableAnteriorId = reclamoActual.responsableActualId?.toString();

    // Actualizar área y responsable juntos
    const actualizado = await this.reclamoRepository.update(id, { 
      areaActual: assignDto.area,
      responsableActualId: assignDto.responsableId 
    } as UpdateReclamoDto);
    
    if (!actualizado) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo asignar el área.`);
    }

    // Registrar cambio de área en el historial (incluye el responsable nuevo)
    await this.estadoReclamoService.registrarCambioArea(
      id,
      areaAnterior,
      assignDto.area as AreaGeneralReclamo,
      undefined,
      `Área reasignada de ${areaAnterior || 'sin asignar'} a ${assignDto.area}`,
      undefined, // fechaBase
      assignDto.responsableId // responsable nuevo asignado junto con el área
    );

    // Registrar cambio de responsable en el historial (incluye el área nueva)
    await this.estadoReclamoService.registrarCambioResponsable(
      id,
      responsableAnteriorId,
      assignDto.responsableId,
      assignDto.area as AreaGeneralReclamo,
      undefined,
      'Responsable asignado junto con cambio de área',
      undefined, // fechaBase
      assignDto.area as AreaGeneralReclamo, // área nueva
      areaAnterior // área anterior
    );

    return actualizado;
  }

  /**
   * Asigna o cambia el responsable de un reclamo sin modificar el estado
   * Solo puede ser usado por coordinadores o administradores
   */
  async asignarResponsable(id: string, asignarDto: AsignarResponsableDto): Promise<ReclamoDocument> {
    // Validar ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    // Buscar el reclamo actual
    const reclamoActual = await this.reclamoRepository.findOne(id);
    if (!reclamoActual) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}".`);
    }

    // Validar que el reclamo permita reasignación
    if (!reclamoActual.puedeReasignar) {
      throw new ForbiddenException(
        `No se puede reasignar el reclamo en estado ${reclamoActual.estadoActual}. ` +
        `Los reclamos en este estado no permiten reasignaciones.`
      );
    }

    const responsableAnteriorId = reclamoActual.responsableActualId?.toString();
    const responsableNuevoId = asignarDto.responsableId;

    // Validar que haya un cambio real
    if (responsableAnteriorId === responsableNuevoId) {
      throw new BadRequestException('El responsable especificado ya está asignado a este reclamo.');
    }

    // Actualizar el responsable
    const reclamo = await this.reclamoRepository.update(id, { 
      responsableActualId: responsableNuevoId 
    });
    
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${id}". No se pudo asignar el responsable.`);
    }

    // Registrar cambio de responsable en el historial
    await this.estadoReclamoService.registrarCambioResponsable(
      id,
      responsableAnteriorId,
      responsableNuevoId,
      reclamoActual.areaActual,
      undefined,
      'Responsable reasignado sin cambio de estado'
    );

    return reclamo;
  }

  /**
   * Asigna un reclamo PENDIENTE a un área y responsable (usado por Coordinadores)
   * Este método actualiza el estado del reclamo de PENDIENTE a EN_PROCESO
   */
  async asignarReclamoPendiente(
    id: string, 
    asignarDto: AsignarReclamoPendienteDto,
    usuario: JwtUser
  ): Promise<ReclamoDocument> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${id}" no es un ObjectId válido de MongoDB`);
    }

    // Verificar que el usuario sea coordinador o admin
    if (![UsuarioRol.COORDINADOR, UsuarioRol.ADMIN].includes(usuario.rol as UsuarioRol)) {
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

    // Registrar cambio de área en el historial
    await this.estadoReclamoService.registrarCambioArea(
      id,
      undefined, // No tenía área anterior
      asignarDto.area,
      usuario.id,
      'Asignación inicial de reclamo pendiente por coordinador'
    );

    // Registrar cambio de responsable si se proporcionó
    if (asignarDto.responsableId) {
      await this.estadoReclamoService.registrarCambioResponsable(
        id,
        undefined, // No tenía responsable anterior
        asignarDto.responsableId,
        asignarDto.area,
        usuario.id,
        'Asignación inicial de responsable por coordinador'
      );
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

  /**
   * Obtener carga de trabajo por área
   */
  async obtenerCargaTrabajo(fechaInicio?: string, fechaFin?: string, area?: string): Promise<{
    porArea: Array<{ area: string; cantidad: number; porcentaje: number }>;
  }> {
    // Construir filtro
    const filtro: any = {};
    
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) {
        filtro.createdAt.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fechaFinDate;
      }
    }

    if (area) {
      filtro.areaActual = area;
    }

    // Obtener reclamos
    const reclamos = await this.reclamoRepository.findAll(filtro);
    const total = reclamos.length;

    // Agrupar por área
    const porAreaMap = new Map<string, number>();
    reclamos.forEach(r => {
      if (r.areaActual) {
        porAreaMap.set(r.areaActual, (porAreaMap.get(r.areaActual) || 0) + 1);
      }
    });

    const porArea = Array.from(porAreaMap.entries()).map(([area, cantidad]) => ({
      area,
      cantidad,
      porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0,
    }));

    return { porArea };
  }

  /**
   * Obtener tiempo promedio de resolución por tipo de reclamo
   */
  async obtenerTiempoResolucionPorTipo(): Promise<Array<{
    tipo: string;
    tiempoPromedioDias: number;
    cantidadResueltos: number;
  }>> {
    // Obtener solo reclamos resueltos
    const reclamosResueltos = await this.reclamoRepository.findAll({
      estadoActual: ReclamoEstado.RESUELTO,
    });

    // Agrupar por tipo
    const porTipoMap = new Map<string, { totalDias: number; cantidad: number }>();

    reclamosResueltos.forEach(r => {
      const reclamoDoc = r as any; // Cast para acceder a createdAt de timestamps
      if (r.fechaResolucion && reclamoDoc.createdAt) {
        const tiempoDias = Math.ceil(
          (new Date(r.fechaResolucion).getTime() - new Date(reclamoDoc.createdAt).getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        const existing = porTipoMap.get(r.tipo);
        if (existing) {
          existing.totalDias += tiempoDias;
          existing.cantidad++;
        } else {
          porTipoMap.set(r.tipo, { totalDias: tiempoDias, cantidad: 1 });
        }
      }
    });

    // Calcular promedios
    return Array.from(porTipoMap.entries()).map(([tipo, data]) => ({
      tipo,
      tiempoPromedioDias: Math.round(data.totalDias / data.cantidad),
      cantidadResueltos: data.cantidad,
    }));
  }

  /**
   * Obtener estadísticas de reclamos con filtro de fecha
   */
  async obtenerEstadisticas(fechaInicio?: string, fechaFin?: string): Promise<{
    totalReclamos: number;
    tasaResolucion: number;
    tasaCancelacion: number;
  }> {
    // Construir filtro de fecha
    const filtroFecha: any = {};
    if (fechaInicio || fechaFin) {
      filtroFecha.createdAt = {};
      if (fechaInicio) {
        filtroFecha.createdAt.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        // Agregar 23:59:59 al final del día
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        filtroFecha.createdAt.$lte = fechaFinDate;
      }
    }

    // Obtener todos los reclamos en el rango de fecha
    const reclamos = await this.reclamoRepository.findAll(filtroFecha);
    const totalReclamos = reclamos.length;

    // Calcular reclamos resueltos (estado RESUELTO)
    const reclamosResueltos = reclamos.filter(
      (r) => r.estadoActual === ReclamoEstado.RESUELTO
    ).length;

    // Calcular reclamos cancelados (estado CANCELADO)
    const reclamosCancelados = reclamos.filter(
      (r) => r.estadoActual === ReclamoEstado.CANCELADO
    ).length;

    // Calcular tasas (porcentaje)
    const tasaResolucion = totalReclamos > 0 
      ? Math.round((reclamosResueltos / totalReclamos) * 100) 
      : 0;

    const tasaCancelacion = totalReclamos > 0 
      ? Math.round((reclamosCancelados / totalReclamos) * 100) 
      : 0;

    return {
      totalReclamos,
      tasaResolucion,
      tasaCancelacion,
    };
  }
}
