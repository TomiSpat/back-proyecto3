import { ResueltoState } from './resuelto-state';
import { ReclamoEstado } from '../reclamo.enums';

describe('ResueltoState', () => {
  let state: ResueltoState;

  beforeEach(() => {
    state = new ResueltoState();
  });

  describe('getNombreEstado', () => {
    it('should return RESUELTO', () => {
      expect(state.getNombreEstado()).toBe(ReclamoEstado.RESUELTO);
    });
  });

  describe('getEstadosPermitidos', () => {
    it('should allow transition to EN_PROCESO only', () => {
      const permitidos = state.getEstadosPermitidos();
      expect(permitidos).toHaveLength(1);
      expect(permitidos).toContain(ReclamoEstado.EN_PROCESO);
    });

    it('should not allow transition to other estados', () => {
      const permitidos = state.getEstadosPermitidos();
      expect(permitidos).not.toContain(ReclamoEstado.PENDIENTE);
      expect(permitidos).not.toContain(ReclamoEstado.EN_REVISION);
      expect(permitidos).not.toContain(ReclamoEstado.CANCELADO);
    });
  });

  describe('getDescripcion', () => {
    it('should return description', () => {
      const descripcion = state.getDescripcion();
      expect(descripcion).toBeTruthy();
      expect(typeof descripcion).toBe('string');
      expect(descripcion).toContain('resuelto');
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
    it('should validate transition to EN_PROCESO with motivoCambio and observaciones', () => {
      const contexto = {
        motivoCambio: 'Cliente reportó que el problema persiste',
        observaciones: 'Es necesario revisar nuevamente el caso porque el problema no está completamente resuelto',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(true);
    });

    it('should reject transition to EN_PROCESO without motivoCambio', () => {
      const contexto = {
        observaciones: 'Es necesario revisar nuevamente el caso',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('justificación');
    });

    it('should reject transition to EN_PROCESO without observaciones', () => {
      const contexto = {
        motivoCambio: 'Cliente reportó problema',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('20 caracteres');
    });

    it('should reject transition to EN_PROCESO with short observaciones', () => {
      const contexto = {
        motivoCambio: 'Reapertura',
        observaciones: 'Texto corto',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('20 caracteres');
    });

    it('should reject invalid transitions', () => {
      const result = state.validarTransicion(ReclamoEstado.PENDIENTE);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('No se puede cambiar');
    });

    it('should reject transition to CANCELADO', () => {
      const result = state.validarTransicion(ReclamoEstado.CANCELADO);
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('No se puede cambiar');
    });
  });

  describe('puedeTransicionarA', () => {
    it('should allow transition to EN_PROCESO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_PROCESO)).toBe(true);
    });

    it('should not allow transition to PENDIENTE', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.PENDIENTE)).toBe(false);
    });

    it('should not allow transition to EN_REVISION', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_REVISION)).toBe(false);
    });

    it('should not allow transition to CANCELADO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.CANCELADO)).toBe(false);
    });
  });
});
