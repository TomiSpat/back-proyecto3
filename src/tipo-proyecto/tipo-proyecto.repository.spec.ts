import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipoProyectoRepository } from './tipo-proyecto.repository';
import { TipoProyecto, TipoProyectoDocument } from './entities/tipo-proyecto.entity';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

describe('TipoProyectoRepository', () => {
  let repository: TipoProyectoRepository;
  let model: Model<TipoProyectoDocument>;

  const mockTipoProyectoModel = jest.fn().mockReturnValue({}) as any;
  mockTipoProyectoModel.new = jest.fn();
  mockTipoProyectoModel.constructor = jest.fn();
  mockTipoProyectoModel.find = jest.fn();
  mockTipoProyectoModel.findOne = jest.fn();
  mockTipoProyectoModel.findOneAndUpdate = jest.fn();
  mockTipoProyectoModel.findByIdAndUpdate = jest.fn();
  mockTipoProyectoModel.save = jest.fn();
  mockTipoProyectoModel.exec = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoProyectoRepository,
        {
          provide: getModelToken(TipoProyecto.name),
          useValue: mockTipoProyectoModel,
        },
      ],
    }).compile();

    repository = module.get<TipoProyectoRepository>(TipoProyectoRepository);
    model = module.get<Model<TipoProyectoDocument>>(getModelToken(TipoProyecto.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tipo proyecto', async () => {
      const createDto: CreateTipoProyectoDto = {
        nombre: 'Test Tipo Proyecto',
        descripcion: 'Test Description',
      };

      const savedTipoProyecto = {
        _id: '507f1f77bcf86cd799439011',
        ...createDto,
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          ...createDto,
        }),
      };

      mockTipoProyectoModel.mockImplementation(() => savedTipoProyecto);

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted tipo proyectos', async () => {
      const mockTipoProyectos = [
        { _id: '1', nombre: 'Tipo 1', isDeleted: false },
        { _id: '2', nombre: 'Tipo 2', isDeleted: false },
      ];

      const execMock = jest.fn().mockResolvedValue(mockTipoProyectos);
      mockTipoProyectoModel.find.mockReturnValue({ exec: execMock });

      const result = await repository.findAll();

      expect(mockTipoProyectoModel.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toEqual(mockTipoProyectos);
    });
  });

  describe('findOne', () => {
    it('should return a tipo proyecto by id', async () => {
      const mockTipoProyecto = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test Tipo Proyecto',
        isDeleted: false,
      };

      const execMock = jest.fn().mockResolvedValue(mockTipoProyecto);
      mockTipoProyectoModel.findOne.mockReturnValue({ exec: execMock });

      const result = await repository.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockTipoProyecto);
    });
  });

  describe('findBy', () => {
    it('should return tipo proyectos matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockTipoProyectos = [
        { _id: '1', nombre: 'Test Tipo', isDeleted: false },
      ];

      const execMock = jest.fn().mockResolvedValue(mockTipoProyectos);
      mockTipoProyectoModel.find.mockReturnValue({ exec: execMock });

      const result = await repository.findBy(filter);

      expect(result).toEqual(mockTipoProyectos);
    });
  });

  describe('update', () => {
    it('should update a tipo proyecto', async () => {
      const updateDto: UpdateTipoProyectoDto = {
        nombre: 'Updated Tipo',
      };

      const updatedTipoProyecto = {
        _id: '507f1f77bcf86cd799439011',
        ...updateDto,
      };

      const execMock = jest.fn().mockResolvedValue(updatedTipoProyecto);
      mockTipoProyectoModel.findOneAndUpdate.mockReturnValue({ exec: execMock });

      const result = await repository.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedTipoProyecto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a tipo proyecto', async () => {
      const execMock = jest.fn().mockResolvedValue({});
      mockTipoProyectoModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      await repository.softDelete('507f1f77bcf86cd799439011');

      expect(mockTipoProyectoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      );
    });
  });
});
