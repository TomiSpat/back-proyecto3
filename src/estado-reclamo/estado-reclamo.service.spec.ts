import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EstadoReclamoService } from './estado-reclamo.service';
import { ReclamoStateFactory } from '../reclamo/state/reclamo-state.factory';

describe('EstadoReclamoService', () => {
  let service: EstadoReclamoService;

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
          provide: getModelToken('Reclamo'),
          useValue: mockReclamoModel,
        },
        {
          provide: getModelToken('HistorialEstadoReclamo'),
          useValue: mockHistorialModel,
        },
        {
          provide: ReclamoStateFactory,
          useValue: mockStateFactory,
        },
      ],
    }).compile();

    service = module.get<EstadoReclamoService>(EstadoReclamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
