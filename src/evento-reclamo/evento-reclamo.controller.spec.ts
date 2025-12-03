import { Test, TestingModule } from '@nestjs/testing';
import { EventoReclamoController } from './evento-reclamo.controller';
import { EventoReclamoService } from './evento-reclamo.service';
import { CreateEventoReclamoDto } from './dto/create-evento-reclamo.dto';
import { UpdateEventoReclamoDto } from './dto/update-evento-reclamo.dto';

describe('EventoReclamoController', () => {
  let controller: EventoReclamoController;
  let service: EventoReclamoService;

  const mockEventoReclamoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventoReclamoController],
      providers: [
        {
          provide: EventoReclamoService,
          useValue: mockEventoReclamoService,
        },
      ],
    }).compile();

    controller = module.get<EventoReclamoController>(EventoReclamoController);
    service = module.get<EventoReclamoService>(EventoReclamoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an evento reclamo', () => {
      const createDto: CreateEventoReclamoDto = {};
      mockEventoReclamoService.create.mockReturnValue('This action adds a new eventoReclamo');

      const result = controller.create(createDto);

      expect(result).toBe('This action adds a new eventoReclamo');
      expect(mockEventoReclamoService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all evento reclamos', () => {
      mockEventoReclamoService.findAll.mockReturnValue('This action returns all eventoReclamo');

      const result = controller.findAll();

      expect(result).toBe('This action returns all eventoReclamo');
    });
  });

  describe('findOne', () => {
    it('should return an evento reclamo by id', () => {
      mockEventoReclamoService.findOne.mockReturnValue('This action returns a #1 eventoReclamo');

      const result = controller.findOne('1');

      expect(result).toBe('This action returns a #1 eventoReclamo');
      expect(mockEventoReclamoService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an evento reclamo', () => {
      const updateDto: UpdateEventoReclamoDto = {};
      mockEventoReclamoService.update.mockReturnValue('This action updates a #1 eventoReclamo');

      const result = controller.update('1', updateDto);

      expect(result).toBe('This action updates a #1 eventoReclamo');
      expect(mockEventoReclamoService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an evento reclamo', () => {
      mockEventoReclamoService.remove.mockReturnValue('This action removes a #1 eventoReclamo');

      const result = controller.remove('1');

      expect(result).toBe('This action removes a #1 eventoReclamo');
      expect(mockEventoReclamoService.remove).toHaveBeenCalledWith(1);
    });
  });
});
