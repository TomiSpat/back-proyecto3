import { Test, TestingModule } from '@nestjs/testing';
import { EstadoReclamoController } from './estado-reclamo.controller';
import { EstadoReclamoService } from './estado-reclamo.service';

describe('EstadoReclamoController', () => {
  let controller: EstadoReclamoController;

  const mockEstadoReclamoService = {
    cambiarEstado: jest.fn(),
    obtenerHistorial: jest.fn(),
    puedeModificarReclamo: jest.fn(),
    puedeReasignarReclamo: jest.fn(),
    obtenerInformacionEstados: jest.fn(),
  };

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
