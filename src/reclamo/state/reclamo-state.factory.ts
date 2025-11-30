import { Injectable } from '@nestjs/common';
import { IReclamoState } from './reclamo-state.interface';
import { ReclamoEstado } from '../reclamo.enums';
import { PendienteState } from './pendiente-state';
import { EnProcesoState } from './en-proceso-state';
import { EnRevisionState } from './en-revision-state';
import { ResueltoState } from './resuelto-state';
import { CanceladoState } from './cancelado-state';

@Injectable()
export class ReclamoStateFactory {
  private estados: Map<ReclamoEstado, IReclamoState>;

  constructor() {
    this.estados = new Map<ReclamoEstado, IReclamoState>([
      [ReclamoEstado.PENDIENTE, new PendienteState()],
      [ReclamoEstado.EN_PROCESO, new EnProcesoState()],
      [ReclamoEstado.EN_REVISION, new EnRevisionState()],
      [ReclamoEstado.RESUELTO, new ResueltoState()],
      [ReclamoEstado.CANCELADO, new CanceladoState()],
    ]);
  }

  /**
   * Obtiene la instancia del estado correspondiente
   */
  getEstado(estado: ReclamoEstado): IReclamoState {
    const estadoInstance = this.estados.get(estado);
    if (!estadoInstance) {
      throw new Error(`Estado ${estado} no encontrado en el factory`);
    }
    return estadoInstance;
  }

  /**
   * Valida si una transición es válida
   */
  validarTransicion(
    estadoActual: ReclamoEstado,
    estadoObjetivo: ReclamoEstado,
    contexto?: any,
  ): { valido: boolean; mensaje?: string } {
    const estado = this.getEstado(estadoActual);
    return estado.validarTransicion(estadoObjetivo, contexto);
  }

  /**
   * Obtiene todos los estados disponibles con su información
   */
  obtenerTodosLosEstados(): Array<{
    estado: ReclamoEstado;
    descripcion: string;
    estadosPermitidos: ReclamoEstado[];
    puedeModificar: boolean;
    puedeReasignar: boolean;
  }> {
    return Array.from(this.estados.entries()).map(([estado, instancia]) => ({
      estado,
      descripcion: instancia.getDescripcion(),
      estadosPermitidos: instancia.getEstadosPermitidos(),
      puedeModificar: instancia.puedeModificar(),
      puedeReasignar: instancia.puedeReasignar(),
    }));
  }
}
