import { Test, TestingModule } from '@nestjs/testing';
import { ProyectoService } from './proyecto.service';
import { ProyectoRepository } from './proyecto.repository';

describe('ProyectoService', () => {
  let service: ProyectoService;

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
      providers: [
        ProyectoService,
        {
          provide: ProyectoRepository,
          useValue: mockProyectoRepository,
        },
      ],
    }).compile();

    service = module.get<ProyectoService>(ProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
