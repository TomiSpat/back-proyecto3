import { CanceladoState } from './cancelado-state';
import { ReclamoEstado } from '../reclamo.enums';

describe('CanceladoState', () => {
  let state: CanceladoState;

  beforeEach(() => {
    state = new CanceladoState();
  });

  describe('getNombreEstado', () => {
    it('should return CANCELADO', () => {
      expect(state.getNombreEstado()).toBe(ReclamoEstado.CANCELADO);
    });
  });

  describe('getEstadosPermitidos', () => {
    it('should not allow any transitions', () => {
      const permitidos = state.getEstadosPermitidos();
      expect(permitidos).toHaveLength(0);
    });
  });

  describe('getDescripcion', () => {
    it('should return description', () => {
      const descripcion = state.getDescripcion();
      expect(descripcion).toBeTruthy();
      expect(typeof descripcion).toBe('string');
      expect(descripcion).toContain('cancelado');
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
    it('should reject transition to PENDIENTE', () => {
      const result = state.validarTransicion(ReclamoEstado.PENDIENTE);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('CANCELADO');
      expect(result.mensaje).toContain('estado final');
    });

    it('should reject transition to EN_PROCESO', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('estado final');
    });

    it('should reject transition to EN_REVISION', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_REVISION);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('estado final');
    });

    it('should reject transition to RESUELTO', () => {
      const result = state.validarTransicion(ReclamoEstado.RESUELTO);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('estado final');
    });

    it('should reject transition to itself', () => {
      const result = state.validarTransicion(ReclamoEstado.CANCELADO);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('estado final');
    });
  });

  describe('puedeTransicionarA', () => {
    it('should not allow transition to any estado', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.PENDIENTE)).toBe(false);
      expect(state.puedeTransicionarA(ReclamoEstado.EN_PROCESO)).toBe(false);
      expect(state.puedeTransicionarA(ReclamoEstado.EN_REVISION)).toBe(false);
      expect(state.puedeTransicionarA(ReclamoEstado.RESUELTO)).toBe(false);
      expect(state.puedeTransicionarA(ReclamoEstado.CANCELADO)).toBe(false);
    });
  });
});
