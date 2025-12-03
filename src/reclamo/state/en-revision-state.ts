import { BaseReclamoState } from './base-reclamo-state';
import { ReclamoEstado } from '../reclamo.enums';

export class EnRevisionState extends BaseReclamoState {
  getNombreEstado(): ReclamoEstado {
    return ReclamoEstado.EN_REVISION;
  }

  getEstadosPermitidos(): ReclamoEstado[] {
    return [
      ReclamoEstado.RESUELTO,
      ReclamoEstado.EN_PROCESO, // Puede volver a proceso si la revisión no es satisfactoria
      ReclamoEstado.CANCELADO,
    ];
  }

  getDescripcion(): string {
    return 'Reclamo en revisión. La solución propuesta está siendo evaluada antes de marcar como resuelto.';
  }

  puedeModificar(): boolean {
    return false; // No se puede modificar en revisión, solo aprobar o rechazar
  }

  puedeReasignar(): boolean {
    return false; // No se puede reasignar durante la revisión
  }

  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string } {
    const validacionBase = super.validarTransicion(estadoObjetivo, contexto);
    if (!validacionBase.valido) {
      return validacionBase;
    }

    // Validación específica: para pasar a RESUELTO debe tener resumen de resolución
    if (estadoObjetivo === ReclamoEstado.RESUELTO) {
      if (!contexto?.resumenResolucion) {
        return {
          valido: false,
          mensaje: 'Para marcar como RESUELTO, debe proporcionar un resumen final de la resolución',
        };
      }
    }

    // Si vuelve a EN_PROCESO, debe tener un motivo
    if (estadoObjetivo === ReclamoEstado.EN_PROCESO) {
      if (!contexto?.motivoCambio) {
        return {
          valido: false,
          mensaje: 'Para devolver a EN_PROCESO, debe indicar el motivo del rechazo de la revisión',
        };
      }
    }

    return { valido: true };
  }
}
