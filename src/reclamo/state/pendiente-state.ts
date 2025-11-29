import { BaseReclamoState } from './base-reclamo-state';
import { ReclamoEstado } from '../reclamo.enums';

export class PendienteState extends BaseReclamoState {
  getNombreEstado(): ReclamoEstado {
    return ReclamoEstado.PENDIENTE;
  }

  getEstadosPermitidos(): ReclamoEstado[] {
    return [
      ReclamoEstado.EN_PROCESO,
      ReclamoEstado.CANCELADO,
    ];
  }

  getDescripcion(): string {
    return 'Reclamo pendiente de asignación y procesamiento. Esperando ser tomado por un responsable.';
  }

  puedeModificar(): boolean {
    return true; // Se puede modificar mientras está pendiente
  }

  puedeReasignar(): boolean {
    return true; // Se puede reasignar a diferentes áreas
  }

  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string } {
    const validacionBase = super.validarTransicion(estadoObjetivo, contexto);
    if (!validacionBase.valido) {
      return validacionBase;
    }

    // Validación específica: para pasar a EN_PROCESO debe tener un responsable asignado
    if (estadoObjetivo === ReclamoEstado.EN_PROCESO) {
      if (!contexto?.responsableId && !contexto?.areaResponsable) {
        return {
          valido: false,
          mensaje: 'Para pasar a EN_PROCESO, el reclamo debe tener un responsable o área asignada',
        };
      }
    }

    return { valido: true };
  }
}
