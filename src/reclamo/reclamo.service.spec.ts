import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoService } from './reclamo.service';

describe('ReclamoService', () => {
  let service: ReclamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReclamoService],
    }).compile();

    service = module.get<ReclamoService>(ReclamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
