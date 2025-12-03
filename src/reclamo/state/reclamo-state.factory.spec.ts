import { ReclamoStateFactory } from './reclamo-state.factory';
import { ReclamoEstado } from '../reclamo.enums';
import { PendienteState } from './pendiente-state';
import { EnProcesoState } from './en-proceso-state';
import { EnRevisionState } from './en-revision-state';
import { ResueltoState } from './resuelto-state';
import { CanceladoState } from './cancelado-state';

describe('ReclamoStateFactory', () => {
  let factory: ReclamoStateFactory;

  beforeEach(() => {
    factory = new ReclamoStateFactory();
  });

  describe('getEstado', () => {
    it('should return PendienteState for PENDIENTE', () => {
      const estado = factory.getEstado(ReclamoEstado.PENDIENTE);
      expect(estado).toBeInstanceOf(PendienteState);
    });

    it('should return EnProcesoState for EN_PROCESO', () => {
      const estado = factory.getEstado(ReclamoEstado.EN_PROCESO);
      expect(estado).toBeInstanceOf(EnProcesoState);
    });

    it('should return EnRevisionState for EN_REVISION', () => {
      const estado = factory.getEstado(ReclamoEstado.EN_REVISION);
      expect(estado).toBeInstanceOf(EnRevisionState);
    });

    it('should return ResueltoState for RESUELTO', () => {
      const estado = factory.getEstado(ReclamoEstado.RESUELTO);
      expect(estado).toBeInstanceOf(ResueltoState);
    });

    it('should return CanceladoState for CANCELADO', () => {
      const estado = factory.getEstado(ReclamoEstado.CANCELADO);
      expect(estado).toBeInstanceOf(CanceladoState);
    });

    it('should throw error for invalid estado', () => {
      expect(() => factory.getEstado('INVALID' as ReclamoEstado)).toThrow('Estado INVALID no encontrado en el factory');
    });
  });

  describe('validarTransicion', () => {
    it('should validate transition from PENDIENTE to EN_PROCESO', () => {
      const contexto = {
        responsableId: '507f1f77bcf86cd799439011',
        areaResponsable: 'SOPORTE_TECNICO',
      };

      const resultado = factory.validarTransicion(
        ReclamoEstado.PENDIENTE,
        ReclamoEstado.EN_PROCESO,
        contexto,
      );

      expect(resultado.valido).toBe(true);
    });

    it('should reject transition from PENDIENTE to RESUELTO', () => {
      const resultado = factory.validarTransicion(
        ReclamoEstado.PENDIENTE,
        ReclamoEstado.RESUELTO,
      );

      expect(resultado.valido).toBe(false);
      expect(resultado.mensaje).toContain('No se puede cambiar');
    });

    it('should reject transition from EN_PROCESO to RESUELTO without observaciones', () => {
      const resultado = factory.validarTransicion(
        ReclamoEstado.EN_PROCESO,
        ReclamoEstado.EN_REVISION,
        {},
      );

      expect(resultado.valido).toBe(false);
      expect(resultado.mensaje).toContain('observaciones');
    });

    it('should validate transition from EN_REVISION to RESUELTO with resumenResolucion', () => {
      const contexto = {
        resumenResolucion: 'Problema resuelto completamente',
      };

      const resultado = factory.validarTransicion(
        ReclamoEstado.EN_REVISION,
        ReclamoEstado.RESUELTO,
        contexto,
      );

      expect(resultado.valido).toBe(true);
    });

    it('should reject transition from CANCELADO to any estado', () => {
      const resultado = factory.validarTransicion(
        ReclamoEstado.CANCELADO,
        ReclamoEstado.PENDIENTE,
      );

      expect(resultado.valido).toBe(false);
      expect(resultado.mensaje).toContain('estado final');
    });

    it('should validate transition from RESUELTO to EN_PROCESO with proper justification', () => {
      const contexto = {
        motivoCambio: 'Cliente reportó que el problema persiste',
        observaciones: 'Se requiere revisión adicional del caso',
      };

      const resultado = factory.validarTransicion(
        ReclamoEstado.RESUELTO,
        ReclamoEstado.EN_PROCESO,
        contexto,
      );

      expect(resultado.valido).toBe(true);
    });
  });

  describe('obtenerTodosLosEstados', () => {
    it('should return all estados with their information', () => {
      const estados = factory.obtenerTodosLosEstados();

      expect(estados).toHaveLength(5);
      expect(estados.map(e => e.estado)).toEqual([
        ReclamoEstado.PENDIENTE,
        ReclamoEstado.EN_PROCESO,
        ReclamoEstado.EN_REVISION,
        ReclamoEstado.RESUELTO,
        ReclamoEstado.CANCELADO,
      ]);

      estados.forEach(estado => {
        expect(estado).toHaveProperty('estado');
        expect(estado).toHaveProperty('descripcion');
        expect(estado).toHaveProperty('estadosPermitidos');
        expect(estado).toHaveProperty('puedeModificar');
        expect(estado).toHaveProperty('puedeReasignar');
      });
    });

    it('should have correct information for PENDIENTE estado', () => {
      const estados = factory.obtenerTodosLosEstados();
      const pendiente = estados.find(e => e.estado === ReclamoEstado.PENDIENTE);

      expect(pendiente).toBeDefined();
      expect(pendiente?.puedeModificar).toBe(true);
      expect(pendiente?.puedeReasignar).toBe(true);
      expect(pendiente?.estadosPermitidos).toContain(ReclamoEstado.EN_PROCESO);
      expect(pendiente?.estadosPermitidos).toContain(ReclamoEstado.CANCELADO);
    });

    it('should have correct information for EN_REVISION estado', () => {
      const estados = factory.obtenerTodosLosEstados();
      const enRevision = estados.find(e => e.estado === ReclamoEstado.EN_REVISION);

      expect(enRevision).toBeDefined();
      expect(enRevision?.puedeModificar).toBe(false);
      expect(enRevision?.puedeReasignar).toBe(false);
      expect(enRevision?.estadosPermitidos).toContain(ReclamoEstado.RESUELTO);
      expect(enRevision?.estadosPermitidos).toContain(ReclamoEstado.EN_PROCESO);
    });

    it('should have correct information for CANCELADO estado', () => {
      const estados = factory.obtenerTodosLosEstados();
      const cancelado = estados.find(e => e.estado === ReclamoEstado.CANCELADO);

      expect(cancelado).toBeDefined();
      expect(cancelado?.puedeModificar).toBe(false);
      expect(cancelado?.puedeReasignar).toBe(false);
      expect(cancelado?.estadosPermitidos).toHaveLength(0);
    });

    it('should have correct information for RESUELTO estado', () => {
      const estados = factory.obtenerTodosLosEstados();
      const resuelto = estados.find(e => e.estado === ReclamoEstado.RESUELTO);

      expect(resuelto).toBeDefined();
      expect(resuelto?.puedeModificar).toBe(false);
      expect(resuelto?.puedeReasignar).toBe(false);
      expect(resuelto?.estadosPermitidos).toEqual([ReclamoEstado.EN_PROCESO]);
    });
  });
});
