import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TipoProyectoService } from './tipo-proyecto.service';
import { TipoProyectoRepository } from './tipo-proyecto.repository';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

describe('TipoProyectoService', () => {
  let service: TipoProyectoService;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockTipoProyectoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoProyectoService,
        {
          provide: TipoProyectoRepository,
          useValue: mockTipoProyectoRepository,
        },
      ],
    }).compile();

    service = module.get<TipoProyectoService>(TipoProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tipo proyecto successfully', async () => {
      const createDto: CreateTipoProyectoDto = {
        nombre: 'Test Tipo Proyecto',
        descripcion: 'Descripcion del tipo de proyecto',
      };
      const mockTipoProyecto = { _id: validObjectId, ...createDto };
      mockTipoProyectoRepository.create.mockResolvedValue(mockTipoProyecto);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTipoProyecto);
      expect(mockTipoProyectoRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all tipo proyectos', async () => {
      const mockTipoProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockTipoProyectoRepository.findAll.mockResolvedValue(mockTipoProyectos);

      const result = await service.findAll();

      expect(result).toEqual(mockTipoProyectos);
      expect(mockTipoProyectoRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return tipo proyectos with filter', async () => {
      const filter = { activo: true };
      const mockTipoProyectos = [{ _id: validObjectId, activo: true }];
      mockTipoProyectoRepository.findAll.mockResolvedValue(mockTipoProyectos);

      const result = await service.findAll(filter);

      expect(result).toEqual(mockTipoProyectos);
      expect(mockTipoProyectoRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a tipo proyecto by id', async () => {
      const mockTipoProyecto = { _id: validObjectId, nombre: 'Test' };
      mockTipoProyectoRepository.findOne.mockResolvedValue(mockTipoProyecto);

      const result = await service.findOne(validObjectId);

      expect(result).toEqual(mockTipoProyecto);
      expect(mockTipoProyectoRepository.findOne).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw NotFoundException when tipo proyecto not found', async () => {
      mockTipoProyectoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(validObjectId)).rejects.toThrow('no encontrado');
    });
  });

  describe('findBy', () => {
    it('should return tipo proyectos matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockTipoProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockTipoProyectoRepository.findBy.mockResolvedValue(mockTipoProyectos);

      const result = await service.findBy(filter);

      expect(result).toEqual(mockTipoProyectos);
      expect(mockTipoProyectoRepository.findBy).toHaveBeenCalledWith(filter);
    });
  });

  describe('update', () => {
    it('should update a tipo proyecto successfully', async () => {
      const updateDto: UpdateTipoProyectoDto = { nombre: 'Updated' };
      const mockTipoProyecto = { _id: validObjectId, nombre: 'Updated' };
      mockTipoProyectoRepository.update.mockResolvedValue(mockTipoProyecto);

      const result = await service.update(validObjectId, updateDto);

      expect(result).toEqual(mockTipoProyecto);
      expect(mockTipoProyectoRepository.update).toHaveBeenCalledWith(validObjectId, updateDto);
    });

    it('should throw NotFoundException when tipo proyecto not found', async () => {
      const updateDto: UpdateTipoProyectoDto = { nombre: 'Updated' };
      mockTipoProyectoRepository.update.mockResolvedValue(null);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(validObjectId, updateDto)).rejects.toThrow('no encontrado');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a tipo proyecto successfully', async () => {
      const mockTipoProyecto = { _id: validObjectId };
      mockTipoProyectoRepository.findOne.mockResolvedValue(mockTipoProyecto);
      mockTipoProyectoRepository.softDelete.mockResolvedValue(undefined);

      await service.softDelete(validObjectId);

      expect(mockTipoProyectoRepository.softDelete).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw NotFoundException when tipo proyecto not found', async () => {
      mockTipoProyectoRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.softDelete(validObjectId)).rejects.toThrow('no encontrado');
    });
  });
});
