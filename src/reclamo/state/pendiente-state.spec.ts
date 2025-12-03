import { PendienteState } from './pendiente-state';
import { ReclamoEstado } from '../reclamo.enums';

describe('PendienteState', () => {
  let state: PendienteState;

  beforeEach(() => {
    state = new PendienteState();
  });

  describe('getNombreEstado', () => {
    it('should return PENDIENTE', () => {
      expect(state.getNombreEstado()).toBe(ReclamoEstado.PENDIENTE);
    });
  });

  describe('getEstadosPermitidos', () => {
    it('should allow transition to EN_PROCESO', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.EN_PROCESO);
    });

    it('should allow transition to CANCELADO', () => {
      expect(state.getEstadosPermitidos()).toContain(ReclamoEstado.CANCELADO);
    });

    it('should not allow other transitions', () => {
      const permitidos = state.getEstadosPermitidos();
      expect(permitidos).toHaveLength(2);
      expect(permitidos).not.toContain(ReclamoEstado.EN_REVISION);
      expect(permitidos).not.toContain(ReclamoEstado.RESUELTO);
    });
  });

  describe('getDescripcion', () => {
    it('should return description', () => {
      const descripcion = state.getDescripcion();
      expect(descripcion).toBeTruthy();
      expect(typeof descripcion).toBe('string');
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
    it('should validate transition to EN_PROCESO with responsable', () => {
      const contexto = {
        responsableId: '507f1f77bcf86cd799439011',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(true);
    });

    it('should validate transition to EN_PROCESO with area', () => {
      const contexto = {
        areaResponsable: 'SOPORTE_TECNICO',
      };

      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, contexto);
      expect(result.valido).toBe(true);
    });

    it('should reject transition to EN_PROCESO without responsable or area', () => {
      const result = state.validarTransicion(ReclamoEstado.EN_PROCESO, {});
      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain('responsable');
    });

    it('should validate transition to CANCELADO without conditions', () => {
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
    it('should allow transition to EN_PROCESO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_PROCESO)).toBe(true);
    });

    it('should allow transition to CANCELADO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.CANCELADO)).toBe(true);
    });

    it('should not allow transition to RESUELTO', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.RESUELTO)).toBe(false);
    });

    it('should not allow transition to EN_REVISION', () => {
      expect(state.puedeTransicionarA(ReclamoEstado.EN_REVISION)).toBe(false);
    });
  });
});
