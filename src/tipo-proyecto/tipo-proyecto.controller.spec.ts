import { Test, TestingModule } from '@nestjs/testing';
import { TipoProyectoController } from './tipo-proyecto.controller';
import { TipoProyectoService } from './tipo-proyecto.service';
import { TipoProyectoRepository } from './tipo-proyecto.repository';

describe('TipoProyectoController', () => {
  let controller: TipoProyectoController;

  const mockTipoProyectoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoProyectoController],
      providers: [
        TipoProyectoService,
        {
          provide: TipoProyectoRepository,
          useValue: mockTipoProyectoRepository,
        },
      ],
    }).compile();

    controller = module.get<TipoProyectoController>(TipoProyectoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
