import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProyectoRepository } from './proyecto.repository';
import { Proyecto, ProyectoDocument } from './entities/proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

describe('ProyectoRepository', () => {
  let repository: ProyectoRepository;
  let model: Model<ProyectoDocument>;

  const mockProyectoModel = jest.fn().mockReturnValue({
    save: jest.fn(),
  }) as any;
  
  mockProyectoModel.find = jest.fn();
  mockProyectoModel.findOne = jest.fn();
  mockProyectoModel.findOneAndUpdate = jest.fn();
  mockProyectoModel.findByIdAndUpdate = jest.fn();
  mockProyectoModel.populate = jest.fn();
  mockProyectoModel.exec = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectoRepository,
        {
          provide: getModelToken(Proyecto.name),
          useValue: mockProyectoModel,
        },
      ],
    }).compile();

    repository = module.get<ProyectoRepository>(ProyectoRepository);
    model = module.get<Model<ProyectoDocument>>(getModelToken(Proyecto.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new proyecto', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Test Proyecto',
        descripcion: 'Test Description for the project that must be longer',
        clienteId: '507f1f77bcf86cd799439011',
        tipoProyectoId: '507f1f77bcf86cd799439012',
        fechaInicio: '2023-01-01',
      };

      const savedProyecto = {
        _id: '507f1f77bcf86cd799439013',
        ...createDto,
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439013',
          ...createDto,
        }),
      };

      mockProyectoModel.mockImplementation(() => savedProyecto);

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted proyectos', async () => {
      const mockProyectos = [
        { _id: '1', nombre: 'Proyecto 1', isDeleted: false },
        { _id: '2', nombre: 'Proyecto 2', isDeleted: false },
      ];

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockProyectos);

      mockProyectoModel.find.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.findAll();

      expect(mockProyectoModel.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toEqual(mockProyectos);
    });
  });

  describe('findOne', () => {
    it('should return a proyecto by id', async () => {
      const mockProyecto = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test Proyecto',
        isDeleted: false,
      };

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockProyecto);

      mockProyectoModel.findOne.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockProyecto);
    });
  });

  describe('findBy', () => {
    it('should return proyectos matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockProyectos = [
        { _id: '1', nombre: 'Test Proyecto', isDeleted: false },
      ];

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockProyectos);

      mockProyectoModel.find.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.findBy(filter);

      expect(result).toEqual(mockProyectos);
    });
  });

  describe('findByCliente', () => {
    it('should return proyectos for a cliente', async () => {
      const clienteId = '507f1f77bcf86cd799439011';
      const mockProyectos = [
        { _id: '1', clienteId, isDeleted: false },
      ];

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockProyectos);

      mockProyectoModel.find.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.findByCliente(clienteId);

      expect(mockProyectoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          clienteId: expect.anything(),
          isDeleted: false,
        }),
      );
      expect(result).toEqual(mockProyectos);
    });
  });

  describe('findByTipoProyecto', () => {
    it('should return proyectos for a tipo proyecto', async () => {
      const tipoProyectoId = '507f1f77bcf86cd799439012';
      const mockProyectos = [
        { _id: '1', tipoProyectoId, isDeleted: false },
      ];

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockProyectos);

      mockProyectoModel.find.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.findByTipoProyecto(tipoProyectoId);

      expect(mockProyectoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoProyectoId: expect.anything(),
          isDeleted: false,
        }),
      );
      expect(result).toEqual(mockProyectos);
    });
  });

  describe('update', () => {
    it('should update a proyecto', async () => {
      const updateDto: UpdateProyectoDto = {
        nombre: 'Updated Proyecto',
      };

      const updatedProyecto = {
        _id: '507f1f77bcf86cd799439011',
        ...updateDto,
      };

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(updatedProyecto);

      mockProyectoModel.findOneAndUpdate.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedProyecto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a proyecto', async () => {
      const execMock = jest.fn().mockResolvedValue({});
      mockProyectoModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      await repository.softDelete('507f1f77bcf86cd799439011');

      expect(mockProyectoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      );
    });
  });
});
