import { Test, TestingModule } from '@nestjs/testing';
import { EventoReclamoController } from './evento-reclamo.controller';
import { EventoReclamoService } from './evento-reclamo.service';

describe('EventoReclamoController', () => {
  let controller: EventoReclamoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventoReclamoController],
      providers: [EventoReclamoService],
    }).compile();

    controller = module.get<EventoReclamoController>(EventoReclamoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
