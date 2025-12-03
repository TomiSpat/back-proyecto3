import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoRepository } from './proyecto.repository';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

describe('ProyectoService', () => {
  let service: ProyectoService;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockProyectoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    findByCliente: jest.fn(),
    findByTipoProyecto: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectoService,
        {
          provide: ProyectoRepository,
          useValue: mockProyectoRepository,
        },
      ],
    }).compile();

    service = module.get<ProyectoService>(ProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a proyecto successfully', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Test Proyecto',
        descripcion: 'Descripcion del proyecto de prueba',
        clienteId: validObjectId,
        tipoProyectoId: validObjectId,
        fechaInicio: '2024-01-01',
      };
      const mockProyecto = { _id: validObjectId, ...createDto };
      mockProyectoRepository.create.mockResolvedValue(mockProyecto);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProyecto);
      expect(mockProyectoRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all proyectos', async () => {
      const mockProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockProyectoRepository.findAll.mockResolvedValue(mockProyectos);

      const result = await service.findAll();

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return proyectos with filter', async () => {
      const filter = { estado: 'activo' };
      const mockProyectos = [{ _id: validObjectId, estado: 'activo' }];
      mockProyectoRepository.findAll.mockResolvedValue(mockProyectos);

      const result = await service.findAll(filter);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a proyecto by id', async () => {
      const mockProyecto = { _id: validObjectId, nombre: 'Test' };
      mockProyectoRepository.findOne.mockResolvedValue(mockProyecto);

      const result = await service.findOne(validObjectId);

      expect(result).toEqual(mockProyecto);
      expect(mockProyectoRepository.findOne).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw NotFoundException when proyecto not found', async () => {
      mockProyectoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(validObjectId)).rejects.toThrow('no encontrado');
    });
  });

  describe('findBy', () => {
    it('should return proyectos matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockProyectoRepository.findBy.mockResolvedValue(mockProyectos);

      const result = await service.findBy(filter);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoRepository.findBy).toHaveBeenCalledWith(filter);
    });
  });

  describe('findByCliente', () => {
    it('should return proyectos by cliente', async () => {
      const mockProyectos = [{ _id: validObjectId, clienteId: validObjectId }];
      mockProyectoRepository.findByCliente.mockResolvedValue(mockProyectos);

      const result = await service.findByCliente(validObjectId);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoRepository.findByCliente).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('findByTipoProyecto', () => {
    it('should return proyectos by tipo proyecto', async () => {
      const mockProyectos = [{ _id: validObjectId, tipoProyectoId: validObjectId }];
      mockProyectoRepository.findByTipoProyecto.mockResolvedValue(mockProyectos);

      const result = await service.findByTipoProyecto(validObjectId);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoRepository.findByTipoProyecto).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('update', () => {
    it('should update a proyecto successfully', async () => {
      const updateDto: UpdateProyectoDto = { nombre: 'Updated' };
      const mockProyecto = { _id: validObjectId, nombre: 'Updated' };
      mockProyectoRepository.update.mockResolvedValue(mockProyecto);

      const result = await service.update(validObjectId, updateDto);

      expect(result).toEqual(mockProyecto);
      expect(mockProyectoRepository.update).toHaveBeenCalledWith(validObjectId, updateDto);
    });

    it('should throw NotFoundException when proyecto not found', async () => {
      const updateDto: UpdateProyectoDto = { nombre: 'Updated' };
      mockProyectoRepository.update.mockResolvedValue(null);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(validObjectId, updateDto)).rejects.toThrow('no encontrado');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a proyecto successfully', async () => {
      const mockProyecto = { _id: validObjectId };
      mockProyectoRepository.findOne.mockResolvedValue(mockProyecto);
      mockProyectoRepository.softDelete.mockResolvedValue(undefined);

      await service.softDelete(validObjectId);

      expect(mockProyectoRepository.softDelete).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw NotFoundException when proyecto not found', async () => {
      mockProyectoRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.softDelete(validObjectId)).rejects.toThrow('no encontrado');
    });
  });
});
