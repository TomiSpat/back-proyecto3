import { ReclamoEstado } from '../reclamo.enums';

export interface IReclamoState {
  /**
   * Obtiene el nombre del estado actual
   */
  getNombreEstado(): ReclamoEstado;

  /**
   * Obtiene los estados a los que se puede transicionar desde este estado
   */
  getEstadosPermitidos(): ReclamoEstado[];

  /**
   * Verifica si se puede transicionar al estado objetivo
   */
  puedeTransicionarA(estadoObjetivo: ReclamoEstado): boolean;

  /**
   * Determina si el reclamo puede ser modificado en este estado
   */
  puedeModificar(): boolean;

  /**
   * Determina si el reclamo puede ser reasignado en este estado
   */
  puedeReasignar(): boolean;

  /**
   * Obtiene la descripción del estado
   */
  getDescripcion(): string;

  /**
   * Valida si se puede realizar la transición con el contexto dado
   */
  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string };
}
