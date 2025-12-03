import { ReclamoDocument } from '../entities/reclamo.entity';

/**
 * DTO para listar reclamos (vista simplificada)
 */
export interface ReclamoListDto {
  _id: string;
  clienteNombre: string;
  clienteApellido: string;
  proyectoNombre: string;
  prioridad: string;
  estadoActual: string;
  responsableNombre: string;
  responsableApellido: string;
  createdAt: Date;
}

/**
 * Mapper de Reclamo
 * Responsabilidad: Transformar entidades de Reclamo a DTOs de respuesta
 */
export class ReclamoMapper {
  /**
   * Mapear un reclamo a formato de lista simplificado
   * Solo incluye: id, cliente (nombre y apellido), proyecto (nombre), prioridad, estado, responsable (nombre y apellido), fecha de creación
   */
  static toListDto(reclamo: any): ReclamoListDto {
    return {
      _id: reclamo._id.toString(),
      clienteNombre: reclamo.clienteId?.nombre || 'N/A',
      clienteApellido: reclamo.clienteId?.apellido || 'N/A',
      proyectoNombre: reclamo.proyectoId?.nombre || 'N/A',
      prioridad: reclamo.prioridad,
      estadoActual: reclamo.estadoActual,
      responsableNombre: reclamo.responsableActualId?.nombre || 'Sin asignar',
      responsableApellido: reclamo.responsableActualId?.apellido || '',
      createdAt: reclamo.createdAt,
    };
  }

  /**
   * Mapear múltiples reclamos a formato de lista
   */
  static toListDtoArray(reclamos: any[]): ReclamoListDto[] {
    return reclamos.map(reclamo => this.toListDto(reclamo));
  }
}
