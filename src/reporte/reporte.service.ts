import { Injectable } from '@nestjs/common';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteRepository } from './reporte.repository';
import { ReclamoEstado } from '../reclamo/reclamo.enums';

/**
 * Servicio de Reportes
 * Responsabilidad: Lógica de negocio para reportes y estadísticas
 * - Procesa datos obtenidos del repositorio
 * - Calcula métricas, porcentajes y promedios
 * - Transforma datos en formato de respuesta
 * - No accede directamente a la base de datos
 */
@Injectable()
export class ReporteService {
  constructor(
    private readonly reporteRepository: ReporteRepository,
  ) {}

  create(createReporteDto: CreateReporteDto) {
    return 'This action adds a new reporte';
  }

  findAll() {
    return `This action returns all reporte`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reporte`;
  }

  update(id: number, updateReporteDto: UpdateReporteDto) {
    return `This action updates a #${id} reporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} reporte`;
  }

  /**
   * Obtener estadísticas de reclamos con filtro de fecha
   * Responsabilidad: Calcular métricas agregadas (total, tasas)
   */
  async obtenerEstadisticas(fechaInicio?: string, fechaFin?: string): Promise<{
    totalReclamos: number;
    tasaResolucion: number;
    tasaCancelacion: number;
  }> {
    // Construir filtro de fecha usando el repositorio
    const filtroFecha = this.reporteRepository.construirFiltroFecha(fechaInicio, fechaFin);

    // Obtener todos los reclamos en el rango de fecha
    const reclamos = await this.reporteRepository.obtenerReclamos(filtroFecha);
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

  /**
   * Obtener carga de trabajo por área
   * Responsabilidad: Calcular distribución y porcentajes por área
   */
  async obtenerCargaTrabajo(fechaInicio?: string, fechaFin?: string, area?: string): Promise<{
    porArea: Array<{ area: string; cantidad: number; porcentaje: number }>;
  }> {
    // Construir filtro de fecha
    const filtro = this.reporteRepository.construirFiltroFecha(fechaInicio, fechaFin);

    // Agregar filtro de área si se proporciona
    if (area) {
      filtro.areaActual = area;
    }

    // Obtener conteo por área usando el repositorio
    const porAreaMap = await this.reporteRepository.contarReclamosPorArea(filtro);
    
    // Calcular total
    const total = Array.from(porAreaMap.values()).reduce((sum, count) => sum + count, 0);

    // Transformar a formato de respuesta con porcentajes
    const porArea = Array.from(porAreaMap.entries()).map(([area, cantidad]) => ({
      area,
      cantidad,
      porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0,
    }));

    return { porArea };
  }

  /**
   * Obtener distribución de reclamos por estado
   * Responsabilidad: Calcular distribución y porcentajes por estado
   */
  async obtenerReclamosPorEstado(fechaInicio?: string, fechaFin?: string): Promise<Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>> {
    // Construir filtro de fecha
    const filtro = this.reporteRepository.construirFiltroFecha(fechaInicio, fechaFin);

    // Obtener conteo por estado usando el repositorio
    const porEstadoMap = await this.reporteRepository.contarReclamosPorEstado(filtro);
    
    // Calcular total
    const total = Array.from(porEstadoMap.values()).reduce((sum, count) => sum + count, 0);

    // Transformar a formato de respuesta con porcentajes
    const porEstado = Array.from(porEstadoMap.entries()).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0,
    }));

    return porEstado;
  }

  /**
   * Obtener tiempo promedio de resolución por tipo de reclamo
   * Responsabilidad: Calcular tiempo promedio y agrupar por tipo
   */
  async obtenerTiempoResolucionPorTipo(): Promise<Array<{
    tipo: string;
    tiempoPromedioDias: number;
    cantidadResueltos: number;
  }>> {
    // Obtener reclamos resueltos con fechas válidas
    const reclamosResueltos = await this.reporteRepository.obtenerReclamosConTiempoResolucion();

    // Agrupar por tipo y calcular tiempos
    const porTipoMap = new Map<string, { totalDias: number; cantidad: number }>();

    reclamosResueltos.forEach(r => {
      const reclamoDoc = r as any; // Cast para acceder a createdAt de timestamps
      
      // Calcular diferencia en días
      const fechaResolucion = r.fechaResolucion ? new Date(r.fechaResolucion) : new Date();
      const fechaCreacion = reclamoDoc.createdAt ? new Date(reclamoDoc.createdAt) : new Date();
      
      const tiempoDias = Math.ceil(
        (fechaResolucion.getTime() - fechaCreacion.getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      // Acumular por tipo
      const existing = porTipoMap.get(r.tipo);
      if (existing) {
        existing.totalDias += tiempoDias;
        existing.cantidad++;
      } else {
        porTipoMap.set(r.tipo, { totalDias: tiempoDias, cantidad: 1 });
      }
    });

    // Calcular promedios y transformar a formato de respuesta
    return Array.from(porTipoMap.entries()).map(([tipo, data]) => ({
      tipo,
      tiempoPromedioDias: Math.round(data.totalDias / data.cantidad),
      cantidadResueltos: data.cantidad,
    }));
  }
}
