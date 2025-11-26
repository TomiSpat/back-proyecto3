import { Test, TestingModule } from '@nestjs/testing';
import { EventoReclamoService } from './evento-reclamo.service';

describe('EventoReclamoService', () => {
  let service: EventoReclamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventoReclamoService],
    }).compile();

    service = module.get<EventoReclamoService>(EventoReclamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
