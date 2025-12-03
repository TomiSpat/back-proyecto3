import { Test, TestingModule } from '@nestjs/testing';
import { ProyectoController } from './proyecto.controller';
import { ProyectoService } from './proyecto.service';
import { ProyectoRepository } from './proyecto.repository';

describe('ProyectoController', () => {
  let controller: ProyectoController;

  const mockProyectoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    findByCliente: jest.fn(),
    findByTipoProyecto: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProyectoController],
      providers: [
        ProyectoService,
        {
          provide: ProyectoRepository,
          useValue: mockProyectoRepository,
        },
      ],
    }).compile();

    controller = module.get<ProyectoController>(ProyectoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
