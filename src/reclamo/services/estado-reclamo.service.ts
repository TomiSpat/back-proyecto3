import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reclamo, ReclamoDocument } from '../entities/reclamo.entity';
import { HistorialEstadoReclamo, HistorialEstadoReclamoDocument } from '../entities/historial-estado-reclamo.entity';
import { ReclamoStateFactory } from '../state/reclamo-state.factory';
import { CambiarEstadoReclamoDto } from '../dto/cambiar-estado-reclamo.dto';
import { ReclamoEstado } from '../reclamo.enums';

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

    // Registrar en el historial ANTES de cambiar el estado
    await this.registrarCambioEstado(
      reclamo._id as Types.ObjectId,
      estadoActual,
      estadoNuevo,
      cambioEstadoDto.areaResponsable || reclamo.areaActual,
      cambioEstadoDto.responsableId,
      cambioEstadoDto.motivoCambio,
      cambioEstadoDto.observaciones,
    );

    // Actualizar el reclamo
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
    areaResponsable: string,
    usuarioResponsableId?: string,
    motivoCambio?: string,
    observaciones?: string,
  ): Promise<void> {
    const historial = new this.historialModel({
      reclamoId,
      estadoAnterior,
      estadoNuevo,
      areaResponsable,
      usuarioResponsableId: usuarioResponsableId ? new Types.ObjectId(usuarioResponsableId) : undefined,
      fechaCambio: new Date(),
      motivoCambio,
      observaciones,
    });

    await historial.save();
  }

  /**
   * Obtiene el historial de cambios de estado de un reclamo
   */
  async obtenerHistorial(reclamoId: string): Promise<HistorialEstadoReclamoDocument[]> {
    if (!reclamoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`El ID "${reclamoId}" no es un ObjectId válido de MongoDB`);
    }

    const historial = await this.historialModel
      .find({ reclamoId: new Types.ObjectId(reclamoId) })
      .populate('usuarioResponsableId')
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
