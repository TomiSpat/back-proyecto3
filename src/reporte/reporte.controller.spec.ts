import { Test, TestingModule } from '@nestjs/testing';
import { ReporteController } from './reporte.controller';
import { ReporteService } from './reporte.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

describe('ReporteController', () => {
  let controller: ReporteController;
  let service: ReporteService;

  const mockReporteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReporteController],
      providers: [
        {
          provide: ReporteService,
          useValue: mockReporteService,
        },
      ],
    }).compile();

    controller = module.get<ReporteController>(ReporteController);
    service = module.get<ReporteService>(ReporteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reporte', () => {
      const createDto: CreateReporteDto = {};
      mockReporteService.create.mockReturnValue('This action adds a new reporte');

      const result = controller.create(createDto);

      expect(result).toBe('This action adds a new reporte');
      expect(mockReporteService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all reportes', () => {
      mockReporteService.findAll.mockReturnValue('This action returns all reporte');

      const result = controller.findAll();

      expect(result).toBe('This action returns all reporte');
    });
  });

  describe('findOne', () => {
    it('should return a reporte by id', () => {
      mockReporteService.findOne.mockReturnValue('This action returns a #1 reporte');

      const result = controller.findOne('1');

      expect(result).toBe('This action returns a #1 reporte');
      expect(mockReporteService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a reporte', () => {
      const updateDto: UpdateReporteDto = {};
      mockReporteService.update.mockReturnValue('This action updates a #1 reporte');

      const result = controller.update('1', updateDto);

      expect(result).toBe('This action updates a #1 reporte');
      expect(mockReporteService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a reporte', () => {
      mockReporteService.remove.mockReturnValue('This action removes a #1 reporte');

      const result = controller.remove('1');

      expect(result).toBe('This action removes a #1 reporte');
      expect(mockReporteService.remove).toHaveBeenCalledWith(1);
    });
  });
});
