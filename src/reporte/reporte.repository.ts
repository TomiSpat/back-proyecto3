import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { IReporteRepository } from './interface/IReporteRepository';
import { ReclamoRepository } from '../reclamo/reclamo.repository';
import { ReclamoEstado } from '../reclamo/reclamo.enums';
import { ReclamoDocument } from '../reclamo/entities/reclamo.entity';

/**
 * Repositorio de Reportes
 * Responsabilidad: Acceso a datos para reportes y estadísticas
 * - Consulta datos de reclamos a través del ReclamoRepository
 * - Aplica filtros y agregaciones necesarias para reportes
 * - No contiene lógica de negocio, solo acceso a datos
 */
@Injectable()
export class ReporteRepository implements IReporteRepository {
  constructor(
    @Inject(forwardRef(() => ReclamoRepository))
    private readonly reclamoRepository: ReclamoRepository,
  ) {}

  /**
   * Obtener todos los reclamos con filtros opcionales
   * @param filtro - Filtros de MongoDB (fechas, estado, área, etc.)
   */
  async obtenerReclamos(filtro?: any): Promise<ReclamoDocument[]> {
    return await this.reclamoRepository.findAll(filtro);
  }

  /**
   * Obtener solo reclamos resueltos
   */
  async obtenerReclamosResueltos(): Promise<ReclamoDocument[]> {
    return await this.reclamoRepository.findAll({
      estadoActual: ReclamoEstado.RESUELTO,
    });
  }

  /**
   * Contar reclamos agrupados por estado
   * @param filtro - Filtros opcionales (fechas, etc.)
   * @returns Map con estado como clave y cantidad como valor
   */
  async contarReclamosPorEstado(filtro?: any): Promise<Map<string, number>> {
    const reclamos = await this.obtenerReclamos(filtro);
    const conteo = new Map<string, number>();

    reclamos.forEach(reclamo => {
      if (reclamo.estadoActual) {
        const estadoActual = conteo.get(reclamo.estadoActual) || 0;
        conteo.set(reclamo.estadoActual, estadoActual + 1);
      }
    });

    return conteo;
  }

  /**
   * Contar reclamos agrupados por área
   * @param filtro - Filtros opcionales (fechas, etc.)
   * @returns Map con área como clave y cantidad como valor
   */
  async contarReclamosPorArea(filtro?: any): Promise<Map<string, number>> {
    const reclamos = await this.obtenerReclamos(filtro);
    const conteo = new Map<string, number>();

    reclamos.forEach(reclamo => {
      if (reclamo.areaActual) {
        const areaActual = conteo.get(reclamo.areaActual) || 0;
        conteo.set(reclamo.areaActual, areaActual + 1);
      }
    });

    return conteo;
  }

  /**
   * Obtener reclamos con tiempo de resolución calculable
   * Solo incluye reclamos resueltos que tienen fecha de resolución y creación
   */
  async obtenerReclamosConTiempoResolucion(): Promise<ReclamoDocument[]> {
    const reclamosResueltos = await this.obtenerReclamosResueltos();
    
    // Filtrar solo los que tienen ambas fechas
    return reclamosResueltos.filter(reclamo => {
      const reclamoDoc = reclamo as any;
      return reclamo.fechaResolucion && reclamoDoc.createdAt;
    });
  }

  /**
   * Construir filtro de fecha para MongoDB
   * @param fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns Objeto de filtro para MongoDB
   */
  construirFiltroFecha(fechaInicio?: string, fechaFin?: string): any {
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

    return filtro;
  }
}
