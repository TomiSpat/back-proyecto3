import { BaseReclamoState } from './base-reclamo-state';
import { ReclamoEstado } from '../reclamo.enums';

export class ResueltoState extends BaseReclamoState {
  getNombreEstado(): ReclamoEstado {
    return ReclamoEstado.RESUELTO;
  }

  getEstadosPermitidos(): ReclamoEstado[] {
    return [
      ReclamoEstado.EN_PROCESO, // Solo si el cliente reabre el reclamo
    ];
  }

  getDescripcion(): string {
    return 'Reclamo resuelto. La solución ha sido implementada y verificada. Estado final del ciclo normal.';
  }

  puedeModificar(): boolean {
    return false; // No se puede modificar un reclamo resuelto
  }

  puedeReasignar(): boolean {
    return false; // No se puede reasignar un reclamo resuelto
  }

  validarTransicion(estadoObjetivo: ReclamoEstado, contexto?: any): { valido: boolean; mensaje?: string } {
    const validacionBase = super.validarTransicion(estadoObjetivo, contexto);
    if (!validacionBase.valido) {
      return validacionBase;
    }

    // Validación específica: para reabrir (volver a EN_PROCESO) debe tener justificación
    if (estadoObjetivo === ReclamoEstado.EN_PROCESO) {
      if (!contexto?.motivoCambio) {
        return {
          valido: false,
          mensaje: 'Para reabrir un reclamo RESUELTO, debe proporcionar una justificación detallada',
        };
      }
      if (!contexto?.observaciones || contexto.observaciones.length < 20) {
        return {
          valido: false,
          mensaje: 'La justificación para reabrir debe tener al menos 20 caracteres explicando el motivo',
        };
      }
    }

    return { valido: true };
  }
}
