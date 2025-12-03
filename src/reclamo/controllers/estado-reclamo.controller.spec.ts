import { Test, TestingModule } from '@nestjs/testing';
import { EstadoReclamoController, InfoEstadosController } from './estado-reclamo.controller';
import { EstadoReclamoService } from '../services/estado-reclamo.service';
import { CambiarEstadoReclamoDto } from '../dto/cambiar-estado-reclamo.dto';
import { ReclamoEstado, AreaGeneralReclamo } from '../reclamo.enums';

describe('EstadoReclamoController', () => {
  let controller: EstadoReclamoController;
  let service: EstadoReclamoService;

  const mockEstadoReclamoService = {
    cambiarEstado: jest.fn(),
    obtenerHistorial: jest.fn(),
    puedeModificarReclamo: jest.fn(),
    puedeReasignarReclamo: jest.fn(),
    obtenerInformacionEstados: jest.fn(),
  };

  const validObjectId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoReclamoController],
      providers: [
        {
          provide: EstadoReclamoService,
          useValue: mockEstadoReclamoService,
        },
      ],
    }).compile();

    controller = module.get<EstadoReclamoController>(EstadoReclamoController);
    service = module.get<EstadoReclamoService>(EstadoReclamoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('cambiarEstado', () => {
    it('should change estado successfully', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.EN_PROCESO,
        areaResponsable: AreaGeneralReclamo.SOPORTE_TECNICO,
        responsableId: validObjectId,
        motivoCambio: 'Asignado a técnico',
        observaciones: 'Iniciando trabajo',
      };

      const expectedResult = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.EN_PROCESO,
      };

      mockEstadoReclamoService.cambiarEstado.mockResolvedValue(expectedResult);

      const result = await controller.cambiarEstado(validObjectId, cambioDto);

      expect(mockEstadoReclamoService.cambiarEstado).toHaveBeenCalledWith(validObjectId, cambioDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle estado change to EN_REVISION', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.EN_REVISION,
        observaciones: 'Solución propuesta',
        resumenResolucion: 'Se aplicó parche',
      };

      const expectedResult = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.EN_REVISION,
      };

      mockEstadoReclamoService.cambiarEstado.mockResolvedValue(expectedResult);

      const result = await controller.cambiarEstado(validObjectId, cambioDto);

      expect(mockEstadoReclamoService.cambiarEstado).toHaveBeenCalledWith(validObjectId, cambioDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle estado change to RESUELTO', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.RESUELTO,
        resumenResolucion: 'Problema resuelto completamente',
      };

      const expectedResult = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.RESUELTO,
        fechaResolucion: new Date(),
      };

      mockEstadoReclamoService.cambiarEstado.mockResolvedValue(expectedResult);

      const result = await controller.cambiarEstado(validObjectId, cambioDto);

      expect(mockEstadoReclamoService.cambiarEstado).toHaveBeenCalledWith(validObjectId, cambioDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle estado change to CANCELADO', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.CANCELADO,
        motivoCambio: 'Cliente solicitó cancelación',
      };

      const expectedResult = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.CANCELADO,
        fechaCierre: new Date(),
      };

      mockEstadoReclamoService.cambiarEstado.mockResolvedValue(expectedResult);

      const result = await controller.cambiarEstado(validObjectId, cambioDto);

      expect(mockEstadoReclamoService.cambiarEstado).toHaveBeenCalledWith(validObjectId, cambioDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('obtenerHistorial', () => {
    it('should return historial de cambios de estado', async () => {
      const expectedHistorial = [
        {
          reclamoId: validObjectId,
          estadoAnterior: ReclamoEstado.PENDIENTE,
          estadoNuevo: ReclamoEstado.EN_PROCESO,
          fechaCambio: new Date(),
          areaResponsable: AreaGeneralReclamo.SOPORTE_TECNICO,
        },
        {
          reclamoId: validObjectId,
          estadoAnterior: ReclamoEstado.EN_PROCESO,
          estadoNuevo: ReclamoEstado.EN_REVISION,
          fechaCambio: new Date(),
          areaResponsable: AreaGeneralReclamo.SOPORTE_TECNICO,
        },
      ];

      mockEstadoReclamoService.obtenerHistorial.mockResolvedValue(expectedHistorial);

      const result = await controller.obtenerHistorial(validObjectId);

      expect(mockEstadoReclamoService.obtenerHistorial).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(expectedHistorial);
    });

    it('should return empty array when no historial exists', async () => {
      mockEstadoReclamoService.obtenerHistorial.mockResolvedValue([]);

      const result = await controller.obtenerHistorial(validObjectId);

      expect(mockEstadoReclamoService.obtenerHistorial).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual([]);
    });
  });

  describe('puedeModificar', () => {
    it('should return true when reclamo can be modified', async () => {
      mockEstadoReclamoService.puedeModificarReclamo.mockResolvedValue(true);

      const result = await controller.puedeModificar(validObjectId);

      expect(mockEstadoReclamoService.puedeModificarReclamo).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(true);
    });

    it('should return false when reclamo cannot be modified', async () => {
      mockEstadoReclamoService.puedeModificarReclamo.mockResolvedValue(false);

      const result = await controller.puedeModificar(validObjectId);

      expect(mockEstadoReclamoService.puedeModificarReclamo).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(false);
    });
  });

  describe('puedeReasignar', () => {
    it('should return true when reclamo can be reassigned', async () => {
      mockEstadoReclamoService.puedeReasignarReclamo.mockResolvedValue(true);

      const result = await controller.puedeReasignar(validObjectId);

      expect(mockEstadoReclamoService.puedeReasignarReclamo).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(true);
    });

    it('should return false when reclamo cannot be reassigned', async () => {
      mockEstadoReclamoService.puedeReasignarReclamo.mockResolvedValue(false);

      const result = await controller.puedeReasignar(validObjectId);

      expect(mockEstadoReclamoService.puedeReasignarReclamo).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(false);
    });
  });
});

describe('InfoEstadosController', () => {
  let controller: InfoEstadosController;
  let service: EstadoReclamoService;

  const mockEstadoReclamoService = {
    obtenerInformacionEstados: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoEstadosController],
      providers: [
        {
          provide: EstadoReclamoService,
          useValue: mockEstadoReclamoService,
        },
      ],
    }).compile();

    controller = module.get<InfoEstadosController>(InfoEstadosController);
    service = module.get<EstadoReclamoService>(EstadoReclamoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('obtenerInformacionEstados', () => {
    it('should return information about all estados', () => {
      const expectedInfo = [
        {
          estado: ReclamoEstado.PENDIENTE,
          descripcion: 'Reclamo pendiente de asignación',
          estadosPermitidos: [ReclamoEstado.EN_PROCESO, ReclamoEstado.CANCELADO],
          puedeModificar: true,
          puedeReasignar: true,
        },
        {
          estado: ReclamoEstado.EN_PROCESO,
          descripcion: 'Reclamo en proceso de resolución',
          estadosPermitidos: [ReclamoEstado.EN_REVISION, ReclamoEstado.PENDIENTE, ReclamoEstado.CANCELADO],
          puedeModificar: true,
          puedeReasignar: true,
        },
        {
          estado: ReclamoEstado.EN_REVISION,
          descripcion: 'Reclamo en revisión',
          estadosPermitidos: [ReclamoEstado.RESUELTO, ReclamoEstado.EN_PROCESO, ReclamoEstado.CANCELADO],
          puedeModificar: false,
          puedeReasignar: false,
        },
        {
          estado: ReclamoEstado.RESUELTO,
          descripcion: 'Reclamo resuelto',
          estadosPermitidos: [ReclamoEstado.EN_PROCESO],
          puedeModificar: false,
          puedeReasignar: false,
        },
        {
          estado: ReclamoEstado.CANCELADO,
          descripcion: 'Reclamo cancelado',
          estadosPermitidos: [],
          puedeModificar: false,
          puedeReasignar: false,
        },
      ];

      mockEstadoReclamoService.obtenerInformacionEstados.mockReturnValue(expectedInfo);

      const result = controller.obtenerInformacionEstados();

      expect(mockEstadoReclamoService.obtenerInformacionEstados).toHaveBeenCalled();
      expect(result).toEqual(expectedInfo);
    });
  });
});
