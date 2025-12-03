/**
 * Interfaz del repositorio de reportes
 * Define los métodos para acceder a los datos necesarios para generar reportes y estadísticas
 */
export interface IReporteRepository {
  /**
   * Obtener todos los reclamos con filtros opcionales
   */
  obtenerReclamos(filtro?: any): Promise<any[]>;

  /**
   * Obtener reclamos resueltos
   */
  obtenerReclamosResueltos(): Promise<any[]>;

  /**
   * Contar reclamos por estado
   */
  contarReclamosPorEstado(filtro?: any): Promise<Map<string, number>>;

  /**
   * Contar reclamos por área
   */
  contarReclamosPorArea(filtro?: any): Promise<Map<string, number>>;

  /**
   * Obtener reclamos con tiempo de resolución
   */
  obtenerReclamosConTiempoResolucion(): Promise<any[]>;
}
