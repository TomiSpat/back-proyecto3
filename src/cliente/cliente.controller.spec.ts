import { Test, TestingModule } from '@nestjs/testing';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { ClienteRepository } from './cliente.repository';

describe('ClienteController', () => {
  let controller: ClienteController;

  const mockClienteRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteController],
      providers: [
        ClienteService,
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
      ],
    }).compile();

    controller = module.get<ClienteController>(ClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
