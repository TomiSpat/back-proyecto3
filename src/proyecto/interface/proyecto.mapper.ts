import { ProyectoDocument } from '../entities/proyecto.entity';

/**
 * DTO para listar proyectos (vista simplificada)
 */
export interface ProyectoListDto {
  _id: string;
  nombre: string;
  clienteNombre: string;
  clienteApellido: string;
  tipoProyecto: string;
}

/**
 * Mapper de Proyecto
 * Responsabilidad: Transformar entidades de Proyecto a DTOs de respuesta
 */
export class ProyectoMapper {
  /**
   * Mapear un proyecto a formato de lista simplificado
   * Solo incluye: nombre, nombre y apellido del cliente, tipo de proyecto
   */
  static toListDto(proyecto: any): ProyectoListDto {
    return {
      _id: proyecto._id.toString(),
      nombre: proyecto.nombre,
      clienteNombre: proyecto.clienteId?.nombre || 'N/A',
      clienteApellido: proyecto.clienteId?.apellido || 'N/A',
      tipoProyecto: proyecto.tipoProyectoId?.nombre || 'N/A',
    };
  }

  /**
   * Mapear múltiples proyectos a formato de lista
   */
  static toListDtoArray(proyectos: any[]): ProyectoListDto[] {
    return proyectos.map(proyecto => this.toListDto(proyecto));
  }
}
