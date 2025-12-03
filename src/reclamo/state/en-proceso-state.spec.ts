import { EnProcesoState } from './en-proceso-state';
import { ReclamoEstado } from '../reclamo.enums';

describe('EnProcesoState', () => {
  let state: EnProcesoState;

  beforeEach(() => {
    state = new EnProcesoState();
  });

  describe('getNombreEstado', () => {
    it('should return EN_PROCESO', () => {
      expect(state.getNombreEstado()).toBe(ReclamoEstado.EN_PROCESO);
    });
  });

  describe('getEstadosPermitidos', () => {
    it('should allow transition to EN_REVISION', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.EN_REVISION);
    });

    it('should allow transition to PENDIENTE', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.PENDIENTE);
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
      expect(descripcion).toContain('proceso');
    });
  });

  describe('puedeModificar', () => {
    it('should return true', () => {
      expect(state.puedeModificar()).toBe(true);
    });
  });

  describe('puedeReasignar', () => {
    it('should return true', () => {
      expect(state.puedeReasignar()).toBe(true);
    });
  });

  describe('validarTransicion', () => {
    it('should validate transition to EN_REVISION with observaciones', () => {
      const contexto = {
        observaciones: 'Solución propuesta implementada',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_REVISION, contexto);
      expect(result.valido).toBe(true);
    });

    it('should validate transition to EN_REVISION with resumenResolucion', () => {
      const contexto = {
        resumenResolucion: 'Se aplicó parche de seguridad',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_REVISION, contexto);
      expect(result.valido).toBe(true);
    });

    it('should reject transition to EN_REVISION without observaciones or resumenResolucion', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_REVISION, {});
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('observaciones');
      expect(result.mensaje).toContain('resumen');
    });

    it('should validate transition to PENDIENTE', () => {
      const result = state.validarTransicion(ReclamoEstado.PENDIENTE);
      expect(result.valido).toBe(true);
    });

    it('should validate transition to CANCELADO', () => {
      const result = state.validarTransicion(ReclamoEstado.CANCELADO);
      expect(result.valido).toBe(true);
    });

    it('should reject invalid transitions', () => {
      const result = state.validarTransicion(ReclamoEstado.RESUELTO);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('No se puede cambiar');
    });
  });

  describe('puedeTransicionarA', () => {
    it('should allow transition to EN_REVISION', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_REVISION)).toBe(true);
    });

    it('should allow transition to PENDIENTE', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.PENDIENTE)).toBe(true);
    });

    it('should allow transition to CANCELADO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.CANCELADO)).toBe(true);
    });

    it('should not allow transition to RESUELTO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.RESUELTO)).toBe(false);
    });
  });
});
