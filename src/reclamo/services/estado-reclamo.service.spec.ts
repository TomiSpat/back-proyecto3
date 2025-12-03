import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoReclamoService } from './estado-reclamo.service';
import { Reclamo, ReclamoDocument } from '../entities/reclamo.entity';
import { HistorialEstadoReclamo, HistorialEstadoReclamoDocument } from '../entities/historial-estado-reclamo.entity';
import { ReclamoStateFactory } from '../state/reclamo-state.factory';
import { CambiarEstadoReclamoDto } from '../dto/cambiar-estado-reclamo.dto';
import { ReclamoEstado, AreaGeneralReclamo } from '../reclamo.enums';

describe('EstadoReclamoService', () => {
  let service: EstadoReclamoService;
  let reclamoModel: Model<ReclamoDocument>;
  let historialModel: Model<HistorialEstadoReclamoDocument>;
  let stateFactory: ReclamoStateFactory;

  const validObjectId = '507f1f77bcf86cd799439011';
  const invalidObjectId = 'invalid-id';

  const mockReclamoModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockHistorialModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  mockHistorialModel.find = jest.fn();

  const mockStateFactory = {
    getEstado: jest.fn(),
    validarTransicion: jest.fn(),
    obtenerTodosLosEstados: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoReclamoService,
        {
          provide: getModelToken(Reclamo.name),
          useValue: mockReclamoModel,
        },
        {
          provide: getModelToken(HistorialEstadoReclamo.name),
          useValue: mockHistorialModel,
        },
        {
          provide: ReclamoStateFactory,
          useValue: mockStateFactory,
        },
      ],
    }).compile();

    service = module.get<EstadoReclamoService>(EstadoReclamoService);
    reclamoModel = module.get<Model<ReclamoDocument>>(getModelToken(Reclamo.name));
    historialModel = module.get<Model<HistorialEstadoReclamoDocument>>(getModelToken(HistorialEstadoReclamo.name));
    stateFactory = module.get<ReclamoStateFactory>(ReclamoStateFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      const mockReclamo = {
        _id: new Types.ObjectId(validObjectId),
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: AreaGeneralReclamo.VENTAS,
      };

      const mockUpdatedReclamo = {
        ...mockReclamo,
        estadoActual: ReclamoEstado.EN_PROCESO,
        puedeModificar: true,
        puedeReasignar: true,
      };

      const mockEstado = {
        puedeModificar: jest.fn().mockReturnValue(true),
        puedeReasignar: jest.fn().mockReturnValue(true),
      };

      mockReclamoModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      mockStateFactory.validarTransicion.mockReturnValue({ valido: true });
      mockStateFactory.getEstado.mockReturnValue(mockEstado);

      mockReclamoModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUpdatedReclamo),
      });

      const result = await service.cambiarEstado(validObjectId, cambioDto);

      expect(mockReclamoModel.findById).toHaveBeenCalledWith(validObjectId);
      expect(mockStateFactory.validarTransicion).toHaveBeenCalled();
      expect(mockReclamoModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedReclamo);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.EN_PROCESO,
      };

      await expect(service.cambiarEstado(invalidObjectId, cambioDto)).rejects.toThrow(BadRequestException);
      await expect(service.cambiarEstado(invalidObjectId, cambioDto)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.EN_PROCESO,
      };

      mockReclamoModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.cambiarEstado(validObjectId, cambioDto)).rejects.toThrow(NotFoundException);
      await expect(service.cambiarEstado(validObjectId, cambioDto)).rejects.toThrow('No se encontró el reclamo');
    });

    it('should throw BadRequestException when trying to change to same estado', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.PENDIENTE,
      };

      const mockReclamo = {
        _id: new Types.ObjectId(validObjectId),
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: AreaGeneralReclamo.VENTAS,
      };

      mockReclamoModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      await expect(service.cambiarEstado(validObjectId, cambioDto)).rejects.toThrow(BadRequestException);
      await expect(service.cambiarEstado(validObjectId, cambioDto)).rejects.toThrow('ya se encuentra en estado');
    });

    it('should throw BadRequestException when transition is not valid', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.RESUELTO,
      };

      const mockReclamo = {
        _id: new Types.ObjectId(validObjectId),
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: AreaGeneralReclamo.VENTAS,
      };

      mockReclamoModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      mockStateFactory.validarTransicion.mockReturnValue({
        valido: false,
        mensaje: 'Transición no permitida',
      });

      await expect(service.cambiarEstado(validObjectId, cambioDto)).rejects.toThrow(BadRequestException);
      await expect(service.cambiarEstado(validObjectId, cambioDto)).rejects.toThrow('Transición no permitida');
    });

    it('should set fechaResolucion when changing to RESUELTO', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.RESUELTO,
        resumenResolucion: 'Problema resuelto',
      };

      const mockReclamo = {
        _id: new Types.ObjectId(validObjectId),
        estadoActual: ReclamoEstado.EN_REVISION,
        areaActual: AreaGeneralReclamo.SOPORTE_TECNICO,
      };

      const mockEstado = {
        puedeModificar: jest.fn().mockReturnValue(false),
        puedeReasignar: jest.fn().mockReturnValue(false),
      };

      mockReclamoModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      mockStateFactory.validarTransicion.mockReturnValue({ valido: true });
      mockStateFactory.getEstado.mockReturnValue(mockEstado);

      mockReclamoModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockReclamo, estadoActual: ReclamoEstado.RESUELTO }),
      });

      await service.cambiarEstado(validObjectId, cambioDto);

      const updateCall = mockReclamoModel.findByIdAndUpdate.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('fechaResolucion');
    });

    it('should set fechaCierre when changing to CANCELADO', async () => {
      const cambioDto: CambiarEstadoReclamoDto = {
        nuevoEstado: ReclamoEstado.CANCELADO,
        motivoCambio: 'Cliente solicitó cancelación',
      };

      const mockReclamo = {
        _id: new Types.ObjectId(validObjectId),
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: AreaGeneralReclamo.VENTAS,
      };

      const mockEstado = {
        puedeModificar: jest.fn().mockReturnValue(false),
        puedeReasignar: jest.fn().mockReturnValue(false),
      };

      mockReclamoModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      mockStateFactory.validarTransicion.mockReturnValue({ valido: true });
      mockStateFactory.getEstado.mockReturnValue(mockEstado);

      mockReclamoModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockReclamo, estadoActual: ReclamoEstado.CANCELADO }),
      });

      await service.cambiarEstado(validObjectId, cambioDto);

      const updateCall = mockReclamoModel.findByIdAndUpdate.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('fechaCierre');
    });
  });

  describe('obtenerHistorial', () => {
    it('should return historial for a reclamo', async () => {
      const mockHistorial = [
        {
          reclamoId: new Types.ObjectId(validObjectId),
          estadoAnterior: ReclamoEstado.PENDIENTE,
          estadoNuevo: ReclamoEstado.EN_PROCESO,
          fechaCambio: new Date(),
        },
      ];

      mockHistorialModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHistorial),
      });

      const result = await service.obtenerHistorial(validObjectId);

      expect(mockHistorialModel.find).toHaveBeenCalledWith({
        reclamoId: new Types.ObjectId(validObjectId),
      });
      expect(result).toEqual(mockHistorial);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.obtenerHistorial(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.obtenerHistorial(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });
  });

  describe('obtenerInformacionEstados', () => {
    it('should return information about all estados', () => {
      const mockEstadosInfo = [
        {
          estado: ReclamoEstado.PENDIENTE,
          descripcion: 'Pendiente',
          estadosPermitidos: [ReclamoEstado.EN_PROCESO, ReclamoEstado.CANCELADO],
          puedeModificar: true,
          puedeReasignar: true,
        },
      ];

      mockStateFactory.obtenerTodosLosEstados.mockReturnValue(mockEstadosInfo);

      const result = service.obtenerInformacionEstados();

      expect(mockStateFactory.obtenerTodosLosEstados).toHaveBeenCalled();
      expect(result).toEqual(mockEstadosInfo);
    });
  });

  describe('obtenerEstadosPermitidos', () => {
    it('should return permitted estados from current estado', () => {
      const mockEstado = {
        getEstadosPermitidos: jest.fn().mockReturnValue([ReclamoEstado.EN_PROCESO, ReclamoEstado.CANCELADO]),
      };

      mockStateFactory.getEstado.mockReturnValue(mockEstado);

      const result = service.obtenerEstadosPermitidos(ReclamoEstado.PENDIENTE);

      expect(mockStateFactory.getEstado).toHaveBeenCalledWith(ReclamoEstado.PENDIENTE);
      expect(result).toEqual([ReclamoEstado.EN_PROCESO, ReclamoEstado.CANCELADO]);
    });
  });

  describe('puedeModificarReclamo', () => {
    it('should return true when reclamo can be modified', async () => {
      const mockReclamo = {
        _id: validObjectId,
        puedeModificar: true,
      };

      mockReclamoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      const result = await service.puedeModificarReclamo(validObjectId);

      expect(mockReclamoModel.findById).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(true);
    });

    it('should return false when reclamo cannot be modified', async () => {
      const mockReclamo = {
        _id: validObjectId,
        puedeModificar: false,
      };

      mockReclamoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      const result = await service.puedeModificarReclamo(validObjectId);

      expect(result).toBe(false);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.puedeModificarReclamo(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.puedeModificarReclamo(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      mockReclamoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.puedeModificarReclamo(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.puedeModificarReclamo(validObjectId)).rejects.toThrow('No se encontró el reclamo');
    });
  });

  describe('puedeReasignarReclamo', () => {
    it('should return true when reclamo can be reassigned', async () => {
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
      };

      mockReclamoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      const result = await service.puedeReasignarReclamo(validObjectId);

      expect(mockReclamoModel.findById).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(true);
    });

    it('should return false when reclamo cannot be reassigned', async () => {
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: false,
      };

      mockReclamoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReclamo),
      });

      const result = await service.puedeReasignarReclamo(validObjectId);

      expect(result).toBe(false);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.puedeReasignarReclamo(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.puedeReasignarReclamo(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      mockReclamoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.puedeReasignarReclamo(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.puedeReasignarReclamo(validObjectId)).rejects.toThrow('No se encontró el reclamo');
    });
  });
});
