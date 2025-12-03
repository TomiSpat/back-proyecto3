import { Test, TestingModule } from '@nestjs/testing';
import { ReporteService } from './reporte.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

describe('ReporteService', () => {
  let service: ReporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReporteService],
    }).compile();

    service = module.get<ReporteService>(ReporteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return confirmation message', () => {
      const createDto: CreateReporteDto = {};
      const result = service.create(createDto);
      expect(result).toBe('This action adds a new reporte');
    });
  });

  describe('findAll', () => {
    it('should return all reportes message', () => {
      const result = service.findAll();
      expect(result).toBe('This action returns all reporte');
    });
  });

  describe('findOne', () => {
    it('should return a specific reporte message', () => {
      const result = service.findOne(1);
      expect(result).toBe('This action returns a #1 reporte');
    });

    it('should return message with correct id', () => {
      const result = service.findOne(5);
      expect(result).toBe('This action returns a #5 reporte');
    });
  });

  describe('update', () => {
    it('should return update confirmation message', () => {
      const updateDto: UpdateReporteDto = {};
      const result = service.update(1, updateDto);
      expect(result).toBe('This action updates a #1 reporte');
    });

    it('should return update message with correct id', () => {
      const updateDto: UpdateReporteDto = {};
      const result = service.update(10, updateDto);
      expect(result).toBe('This action updates a #10 reporte');
    });
  });

  describe('remove', () => {
    it('should return remove confirmation message', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 reporte');
    });

    it('should return remove message with correct id', () => {
      const result = service.remove(15);
      expect(result).toBe('This action removes a #15 reporte');
    });
  });
});
