import { Test, TestingModule } from '@nestjs/testing';
import { TipoProyectoService } from './tipo-proyecto.service';
import { TipoProyectoRepository } from './tipo-proyecto.repository';

describe('TipoProyectoService', () => {
  let service: TipoProyectoService;

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
      providers: [
        TipoProyectoService,
        {
          provide: TipoProyectoRepository,
          useValue: mockTipoProyectoRepository,
        },
      ],
    }).compile();

    service = module.get<TipoProyectoService>(TipoProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
