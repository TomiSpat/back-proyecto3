import { BaseReclamoState } from './base-reclamo-state';
import { ReclamoEstado } from '../reclamo.enums';

export class CanceladoState extends BaseReclamoState {
  getNombreEstado(): ReclamoEstado {
    return ReclamoEstado.CANCELADO;
  }

  getEstadosPermitidos(): ReclamoEstado[] {
    return []; // Estado final, no permite transiciones
  }

  getDescripcion(): string {
    return 'Reclamo cancelado. No se continuará con su procesamiento. Estado final.';
  }

  puedeModificar(): boolean {
    return false; // No se puede modificar un reclamo cancelado
  }

  puedeReasignar(): boolean {
    return false; // No se puede reasignar un reclamo cancelado
  }

  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string } {
    return {
      valido: false,
      mensaje: 'Un reclamo CANCELADO no puede cambiar a ningún otro estado. Es un estado final.',
    };
  }
}
