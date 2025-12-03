import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CambiarEstadoReclamoDto } from 'src/reclamo/dto/cambiar-estado-reclamo.dto';
import { HistorialEstadoReclamo, HistorialEstadoReclamoDocument, TipoCambioHistorial } from 'src/reclamo/entities/historial-estado-reclamo.entity';
import { Reclamo, ReclamoDocument } from 'src/reclamo/entities/reclamo.entity';
import { AreaGeneralReclamo, ReclamoEstado } from 'src/reclamo/reclamo.enums';
import { ReclamoStateFactory } from 'src/reclamo/state/reclamo-state.factory';


@Injectable()
export class EstadoReclamoService {
  constructor(
    @InjectModel(Reclamo.name) private reclamoModel: Model<ReclamoDocument>,
    @InjectModel(HistorialEstadoReclamo.name) 
    private historialModel: Model<HistorialEstadoReclamoDocument>,
    private readonly stateFactory: ReclamoStateFactory,
  ) {}

  /**
   * Cambia el estado de un reclamo validando las reglas de negocio
   */
  async cambiarEstado(
    reclamoId: string,
    cambioEstadoDto: CambiarEstadoReclamoDto,
  ): Promise<ReclamoDocument> {
    // Validar ObjectId
    if (!reclamoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${reclamoId}" no es un ObjectId válido de MongoDB`);
    }

    // Buscar el reclamo
    const reclamo = await this.reclamoModel
      .findById(reclamoId)
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .exec();

    if (!reclamo) {
      throw new NotFoundException(
        `No se encontró el reclamo con ID "${reclamoId}". Verifique que el ID sea correcto.`,
      );
    }

    const estadoActual = reclamo.estadoActual;
    const estadoNuevo = cambioEstadoDto.nuevoEstado;

    // Validar que no sea el mismo estado
    if (estadoActual === estadoNuevo) {
      throw new BadRequestException(
        `El reclamo ya se encuentra en estado ${estadoNuevo}. No se puede cambiar al mismo estado.`,
      );
    }

    // Validar la transición usando el patrón State
    const contexto = {
      responsableId: cambioEstadoDto.responsableId,
      areaResponsable: cambioEstadoDto.areaResponsable || reclamo.areaActual,
      observaciones: cambioEstadoDto.observaciones,
      motivoCambio: cambioEstadoDto.motivoCambio,
      resumenResolucion: cambioEstadoDto.resumenResolucion,
    };

    const validacion = this.stateFactory.validarTransicion(estadoActual, estadoNuevo, contexto);

    if (!validacion.valido) {
      throw new BadRequestException(validacion.mensaje);
    }

    // Obtener el nuevo estado para actualizar permisos
    const nuevoEstadoInstance = this.stateFactory.getEstado(estadoNuevo);

    // ============================================================
    // REGISTRAR CAMBIOS EN EL HISTORIAL (TRAZABILIDAD COMPLETA)
    // ============================================================
    // ORDEN: Primero área, luego responsable, luego estado
    // Esto asegura que la línea de tiempo muestre todos los cambios en orden lógico
    // Usamos fechas con milisegundos incrementales para mantener el orden cronológico

    const fechaBase = new Date();
    let contadorMs = 0; // Contador de milisegundos para ordenar eventos

    // 1. Registrar cambio de ÁREA si cambió
    const areaAnterior = reclamo.areaActual;
    const areaNueva = cambioEstadoDto.areaResponsable;
    
    if (areaNueva && areaAnterior !== areaNueva) {
      const fechaEvento = new Date(fechaBase.getTime() + contadorMs);
      await this.registrarCambioArea(
        reclamo._id as Types.ObjectId,
        areaAnterior,
        areaNueva,
        cambioEstadoDto.responsableId,
        cambioEstadoDto.observaciones || `Área cambiada durante cambio de estado a ${estadoNuevo}`,
        fechaEvento,
      );
      contadorMs += 100; // Incrementar 100ms para el siguiente evento
    }

    // 2. Registrar cambio de RESPONSABLE si cambió
    const responsableAnteriorId = reclamo.responsableActualId?.toString();
    const responsableNuevoId = cambioEstadoDto.responsableId;
    
    if (responsableNuevoId && responsableAnteriorId !== responsableNuevoId) {
      const fechaEvento = new Date(fechaBase.getTime() + contadorMs);
      await this.registrarCambioResponsable(
        reclamo._id as Types.ObjectId,
        responsableAnteriorId,
        responsableNuevoId,
        areaNueva || areaAnterior,
        cambioEstadoDto.responsableId,
        cambioEstadoDto.observaciones || `Responsable cambiado durante cambio de estado a ${estadoNuevo}`,
        fechaEvento,
      );
      contadorMs += 100; // Incrementar 100ms para el siguiente evento
    }

    // 3. Registrar cambio de ESTADO
    const fechaEvento = new Date(fechaBase.getTime() + contadorMs);
    await this.registrarCambioEstado(
      reclamo._id as Types.ObjectId,
      estadoActual,
      estadoNuevo,
      areaNueva || areaAnterior,
      cambioEstadoDto.responsableId,
      cambioEstadoDto.motivoCambio,
      cambioEstadoDto.observaciones,
      fechaEvento,
    );

    // ============================================================
    // ACTUALIZAR EL RECLAMO
    // ============================================================
    const updateData: any = {
      estadoActual: estadoNuevo,
      puedeModificar: nuevoEstadoInstance.puedeModificar(),
      puedeReasignar: nuevoEstadoInstance.puedeReasignar(),
    };

    // Actualizar área si se proporcionó
    if (cambioEstadoDto.areaResponsable) {
      updateData.areaActual = cambioEstadoDto.areaResponsable;
    }

    // Actualizar responsable si se proporcionó
    if (cambioEstadoDto.responsableId) {
      updateData.responsableActualId = new Types.ObjectId(cambioEstadoDto.responsableId);
    }

    // Actualizar resumen de resolución si se proporcionó
    if (cambioEstadoDto.resumenResolucion) {
      updateData.resumenResolucion = cambioEstadoDto.resumenResolucion;
    }

    // Si el estado es RESUELTO, registrar fecha de resolución
    if (estadoNuevo === ReclamoEstado.RESUELTO) {
      updateData.fechaResolucion = new Date();
    }

    // Si el estado es CANCELADO, registrar fecha de cierre
    if (estadoNuevo === ReclamoEstado.CANCELADO) {
      updateData.fechaCierre = new Date();
    }

    const reclamoActualizado = await this.reclamoModel
      .findByIdAndUpdate(reclamoId, updateData, { new: true })
      .populate('clienteId')
      .populate('proyectoId')
      .populate('tipoProyectoId')
      .populate('responsableActualId')
      .exec();

    return reclamoActualizado!;
  }

  /**
   * Registra un cambio de estado en el historial
   */
  private async registrarCambioEstado(
    reclamoId: Types.ObjectId,
    estadoAnterior: ReclamoEstado,
    estadoNuevo: ReclamoEstado,
    areaResponsable: AreaGeneralReclamo | undefined,
    usuarioResponsableId?: string,
    motivoCambio?: string,
    observaciones?: string,
    fechaBase?: Date,
  ): Promise<void> {
    const historial = new this.historialModel({
      reclamoId,
      tipoCambio: TipoCambioHistorial.ESTADO,
      estadoAnterior,
      estadoNuevo,
      areaResponsable,
      usuarioResponsableId: usuarioResponsableId ? new Types.ObjectId(usuarioResponsableId) : undefined,
      fechaCambio: fechaBase || new Date(),
      motivoCambio,
      observaciones,
    });

    await historial.save();
  }

  /**
   * Registra un cambio de área en el historial
   */
  async registrarCambioArea(
    reclamoId: Types.ObjectId | string,
    areaAnterior: AreaGeneralReclamo | undefined,
    areaNueva: AreaGeneralReclamo,
    usuarioResponsableId?: string,
    observaciones?: string,
    fechaBase?: Date,
  ): Promise<void> {
    // Si no hay cambio real, no registrar
    if (areaAnterior === areaNueva) {
      return;
    }

    const historial = new this.historialModel({
      reclamoId: typeof reclamoId === 'string' ? new Types.ObjectId(reclamoId) : reclamoId,
      tipoCambio: TipoCambioHistorial.AREA,
      areaAnterior,
      areaNueva,
      areaResponsable: areaNueva,
      usuarioResponsableId: usuarioResponsableId ? new Types.ObjectId(usuarioResponsableId) : undefined,
      fechaCambio: fechaBase || new Date(),
      observaciones,
    });

    await historial.save();
  }

  /**
   * Registra un cambio de responsable en el historial
   */
  async registrarCambioResponsable(
    reclamoId: Types.ObjectId | string,
    responsableAnteriorId: string | undefined,
    responsableNuevoId: string | undefined,
    areaResponsable: AreaGeneralReclamo | undefined,
    usuarioResponsableId?: string,
    observaciones?: string,
    fechaBase?: Date,
  ): Promise<void> {
    // Si no hay cambio real, no registrar
    if (responsableAnteriorId === responsableNuevoId) {
      return;
    }

    const historial = new this.historialModel({
      reclamoId: typeof reclamoId === 'string' ? new Types.ObjectId(reclamoId) : reclamoId,
      tipoCambio: TipoCambioHistorial.RESPONSABLE,
      responsableAnteriorId: responsableAnteriorId ? new Types.ObjectId(responsableAnteriorId) : undefined,
      responsableNuevoId: responsableNuevoId ? new Types.ObjectId(responsableNuevoId) : undefined,
      areaResponsable,
      usuarioResponsableId: usuarioResponsableId ? new Types.ObjectId(usuarioResponsableId) : undefined,
      fechaCambio: fechaBase || new Date(),
      observaciones,
    });

    await historial.save();
  }

  /**
   * Obtiene el historial de cambios de un reclamo (estados, área, responsable)
   */
  async obtenerHistorial(reclamoId: string): Promise<HistorialEstadoReclamoDocument[]> {
    if (!reclamoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${reclamoId}" no es un ObjectId válido de MongoDB`);
    }

    const historial = await this.historialModel
      .find({ reclamoId: new Types.ObjectId(reclamoId) })
      .populate('usuarioResponsableId')
      .populate('responsableAnteriorId')
      .populate('responsableNuevoId')
      .sort({ fechaCambio: 1 }) // Ordenar cronológicamente
      .exec();

    return historial;
  }

  /**
   * Obtiene información sobre todos los estados disponibles
   */
  obtenerInformacionEstados() {
    return this.stateFactory.obtenerTodosLosEstados();
  }

  /**
   * Obtiene los estados permitidos desde un estado actual
   */
  obtenerEstadosPermitidos(estadoActual: ReclamoEstado): ReclamoEstado[] {
    const estado = this.stateFactory.getEstado(estadoActual);
    return estado.getEstadosPermitidos();
  }

  /**
   * Verifica si un reclamo puede ser modificado en su estado actual
   */
  async puedeModificarReclamo(reclamoId: string): Promise<boolean> {
    if (!reclamoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${reclamoId}" no es un ObjectId válido de MongoDB`);
    }

    const reclamo = await this.reclamoModel.findById(reclamoId).exec();
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${reclamoId}"`);
    }

    return reclamo.puedeModificar;
  }

  /**
   * Verifica si un reclamo puede ser reasignado en su estado actual
   */
  async puedeReasignarReclamo(reclamoId: string): Promise<boolean> {
    if (!reclamoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${reclamoId}" no es un ObjectId válido de MongoDB`);
    }

    const reclamo = await this.reclamoModel.findById(reclamoId).exec();
    if (!reclamo) {
      throw new NotFoundException(`No se encontró el reclamo con ID "${reclamoId}"`);
    }

    return reclamo.puedeReasignar;
  }
}