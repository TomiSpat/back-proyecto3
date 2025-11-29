import { BaseReclamoState } from './base-reclamo-state';
import { ReclamoEstado } from '../reclamo.enums';

export class EnProcesoState extends BaseReclamoState {
  getNombreEstado(): ReclamoEstado {
    return ReclamoEstado.EN_PROCESO;
  }

  getEstadosPermitidos(): ReclamoEstado[] {
    return [
      ReclamoEstado.EN_REVISION,
      ReclamoEstado.PENDIENTE, // Puede volver a pendiente si se necesita reasignar
      ReclamoEstado.CANCELADO,
    ];
  }

  getDescripcion(): string {
    return 'Reclamo en proceso de resolución. El responsable está trabajando activamente en él.';
  }

  puedeModificar(): boolean {
    return true; // Se puede modificar mientras se trabaja en él
  }

  puedeReasignar(): boolean {
    return true; // Se puede reasignar a otro responsable o área
  }

  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string } {
    const validacionBase = super.validarTransicion(estadoObjetivo, contexto);
    if (!validacionBase.valido) {
      return validacionBase;
    }

    // Validación específica: para pasar a EN_REVISION debe tener observaciones o solución propuesta
    if (estadoObjetivo === ReclamoEstado.EN_REVISION) {
      if (!contexto?.observaciones && !contexto?.resumenResolucion) {
        return {
          valido: false,
          mensaje: 'Para pasar a EN_REVISION, debe proporcionar observaciones o un resumen de la resolución propuesta',
        };
      }
    }

    return { valido: true };
  }
}
