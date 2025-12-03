import { Test, TestingModule } from '@nestjs/testing';
import { EventoReclamoService } from './evento-reclamo.service';
import { CreateEventoReclamoDto } from './dto/create-evento-reclamo.dto';
import { UpdateEventoReclamoDto } from './dto/update-evento-reclamo.dto';

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

  describe('create', () => {
    it('should return confirmation message', () => {
      const createDto: CreateEventoReclamoDto = {};
      const result = service.create(createDto);
      expect(result).toBe('This action adds a new eventoReclamo');
    });
  });

  describe('findAll', () => {
    it('should return all eventoReclamos message', () => {
      const result = service.findAll();
      expect(result).toBe('This action returns all eventoReclamo');
    });
  });

  describe('findOne', () => {
    it('should return a specific eventoReclamo message', () => {
      const result = service.findOne(1);
      expect(result).toBe('This action returns a #1 eventoReclamo');
    });

    it('should return message with correct id', () => {
      const result = service.findOne(5);
      expect(result).toBe('This action returns a #5 eventoReclamo');
    });
  });

  describe('update', () => {
    it('should return update confirmation message', () => {
      const updateDto: UpdateEventoReclamoDto = {};
      const result = service.update(1, updateDto);
      expect(result).toBe('This action updates a #1 eventoReclamo');
    });

    it('should return update message with correct id', () => {
      const updateDto: UpdateEventoReclamoDto = {};
      const result = service.update(10, updateDto);
      expect(result).toBe('This action updates a #10 eventoReclamo');
    });
  });

  describe('remove', () => {
    it('should return remove confirmation message', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 eventoReclamo');
    });

    it('should return remove message with correct id', () => {
      const result = service.remove(15);
      expect(result).toBe('This action removes a #15 eventoReclamo');
    });
  });
});
