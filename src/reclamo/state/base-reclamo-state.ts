import { IReclamoState } from './reclamo-state.interface';
import { ReclamoEstado } from '../reclamo.enums';

export abstract class BaseReclamoState implements IReclamoState {
  abstract getNombreEstado(): ReclamoEstado;
  abstract getEstadosPermitidos(): ReclamoEstado[];
  abstract getDescripcion(): string;

  puedeTransicionarA(estadoObjetivo: ReclamoEstado): boolean {
    return this.getEstadosPermitidos().includes(estadoObjetivo);
  }

  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string } {
    if (!this.puedeTransicionarA(estadoObjetivo)) {
      return {
        valido: false,
        mensaje: `No se puede cambiar de ${this.getNombreEstado()} a ${estadoObjetivo}. Transiciones permitidas: ${this.getEstadosPermitidos().join(', ')}`,
      };
    }

    return { valido: true };
  }

  // Por defecto, los estados permiten modificación y reasignación
  // Las clases hijas pueden sobrescribir estos métodos
  puedeModificar(): boolean {
    return true;
  }

  puedeReasignar(): boolean {
    return true;
  }
}
