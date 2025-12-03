import { EnRevisionState } from './en-revision-state';
import { ReclamoEstado } from '../reclamo.enums';

describe('EnRevisionState', () => {
  let state: EnRevisionState;

  beforeEach(() => {
    state = new EnRevisionState();
  });

  describe('getNombreEstado', () => {
    it('should return EN_REVISION', () => {
      expect(state.getNombreEstado()).toBe(ReclamoEstado.EN_REVISION);
    });
  });

  describe('getEstadosPermitidos', () => {
    it('should allow transition to RESUELTO', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.RESUELTO);
    });

    it('should allow transition to EN_PROCESO', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.EN_PROCESO);
    });

    it('should allow transition to CANCELADO', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.CANCELADO);
    });

    it('should have exactly 3 allowed transitions', () => {
      expect(state.getEstadosPermitidos()).toHaveLength(3);
    });
  });

  describe('getDescripcion', () => {
    it('should return description', () => {
      const descripcion = state.getDescripcion();
      expect(descripcion).toBeTruthy();
      expect(typeof descripcion).toBe('string');
      expect(descripcion).toContain('revisión');
    });
  });

  describe('puedeModificar', () => {
    it('should return false', () => {
      expect(state.puedeModificar()).toBe(false);
    });
  });

  describe('puedeReasignar', () => {
    it('should return false', () => {
      expect(state.puedeReasignar()).toBe(false);
    });
  });

  describe('validarTransicion', () => {
    it('should validate transition to RESUELTO with resumenResolucion', () => {
      const contexto = {
        resumenResolucion: 'Problema resuelto completamente',
      };

      const result = state.validarTransicion(ReclamoEstado.RESUELTO, contexto);
      expect(result.valido).toBe(true);
    });

    it('should reject transition to RESUELTO without resumenResolucion', () => {
      const result = state.validarTransicion(ReclamoEstado.RESUELTO, {});
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('resumen');
      expect(result.mensaje).toContain('resolución');
    });

    it('should validate transition to EN_PROCESO with motivoCambio', () => {
      const contexto = {
        motivoCambio: 'La solución no fue satisfactoria',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(true);
    });

    it('should reject transition to EN_PROCESO without motivoCambio', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, {});
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('motivo');
      expect(result.mensaje).toContain('rechazo');
    });

    it('should validate transition to CANCELADO', () => {
      const result = state.validarTransicion(ReclamoEstado.CANCELADO);
      expect(result.valido).toBe(true);
    });

    it('should reject invalid transitions', () => {
      const result = state.validarTransicion(ReclamoEstado.PENDIENTE);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('No se puede cambiar');
    });
  });

  describe('puedeTransicionarA', () => {
    it('should allow transition to RESUELTO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.RESUELTO)).toBe(true);
    });

    it('should allow transition to EN_PROCESO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_PROCESO)).toBe(true);
    });

    it('should allow transition to CANCELADO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.CANCELADO)).toBe(true);
    });

    it('should not allow transition to PENDIENTE', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.PENDIENTE)).toBe(false);
    });
  });
});
