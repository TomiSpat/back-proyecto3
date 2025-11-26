import { Test, TestingModule } from '@nestjs/testing';
import { EstadoReclamoService } from './estado-reclamo.service';

describe('EstadoReclamoService', () => {
  let service: EstadoReclamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoReclamoService],
    }).compile();

    service = module.get<EstadoReclamoService>(EstadoReclamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
