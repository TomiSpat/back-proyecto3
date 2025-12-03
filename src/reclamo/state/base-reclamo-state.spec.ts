import { BaseReclamoState } from './base-reclamo-state';
import { ReclamoEstado } from '../reclamo.enums';

class TestReclamoState extends BaseReclamoState {
  getNombreEstado(): ReclamoEstado {
    return ReclamoEstado.PENDIENTE;
  }

  getEstadosPermitidos(): ReclamoEstado[] {
    return [ReclamoEstado.EN_PROCESO, ReclamoEstado.CANCELADO];
  }

  getDescripcion(): string {
    return 'Test estado';
  }
}

describe('BaseReclamoState', () => {
  let state: TestReclamoState;

  beforeEach(() => {
    state = new TestReclamoState();
  });

  describe('puedeTransicionarA', () => {
    it('should return true for allowed transitions', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_PROCESO)).toBe(true);
      expect(state.puedeTransicionarA(ReclamoEstado.CANCELADO)).toBe(true);
    });

    it('should return false for disallowed transitions', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.RESUELTO)).toBe(false);
      expect(state.puedeTransicionarA(ReclamoEstado.EN_REVISION)).toBe(false);
    });
  });

  describe('validarTransicion', () => {
    it('should return valid for allowed transitions', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO);
      expect(result.valido).toBe(true);
      expect(result.mensaje).toBeUndefined();
    });

    it('should return invalid with message for disallowed transitions', () => {
      const result = state.validarTransicion(ReclamoEstado.RESUELTO);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('No se puede cambiar');
      expect(result.mensaje).toContain('PENDIENTE');
      expect(result.mensaje).toContain('RESUELTO');
    });

    it('should include allowed transitions in error message', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_REVISION);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('EN_PROCESO');
      expect(result.mensaje).toContain('CANCELADO');
    });
  });

  describe('puedeModificar', () => {
    it('should return true by default', () => {
      expect(state.puedeModificar()).toBe(true);
    });
  });

  describe('puedeReasignar', () => {
    it('should return true by default', () => {
      expect(state.puedeReasignar()).toBe(true);
    });
  });
});
