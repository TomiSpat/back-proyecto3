import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoController } from './reclamo.controller';
import { ReclamoService } from './reclamo.service';

describe('ReclamoController', () => {
  let controller: ReclamoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamoController],
      providers: [ReclamoService],
    }).compile();

    controller = module.get<ReclamoController>(ReclamoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
