import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReclamoRepository } from './reclamo.repository';
import { Reclamo, ReclamoDocument } from './entities/reclamo.entity';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { ReclamoCriticidad, ReclamoPrioridad, ReclamoTipo } from './reclamo.enums';

describe('ReclamoRepository', () => {
  let repository: ReclamoRepository;
  let model: Model<ReclamoDocument>;

  const mockReclamoModel = jest.fn().mockReturnValue({}) as any;
  mockReclamoModel.new = jest.fn();
  mockReclamoModel.constructor = jest.fn();
  mockReclamoModel.find = jest.fn();
  mockReclamoModel.findOne = jest.fn();
  mockReclamoModel.findById = jest.fn();
  mockReclamoModel.findOneAndUpdate = jest.fn();
  mockReclamoModel.findByIdAndUpdate = jest.fn();
  mockReclamoModel.save = jest.fn();
  mockReclamoModel.exec = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReclamoRepository,
        {
          provide: getModelToken(Reclamo.name),
          useValue: mockReclamoModel,
        },
      ],
    }).compile();

    repository = module.get<ReclamoRepository>(ReclamoRepository);
    model = module.get<Model<ReclamoDocument>>(getModelToken(Reclamo.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reclamo', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test Reclamo',
        clienteId: '507f1f77bcf86cd799439011',
        proyectoId: '507f1f77bcf86cd799439012',
        tipoProyectoId: '507f1f77bcf86cd799439013',
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
        // estadoActual: 'Pendiente',
      };

      const savedReclamo = {
        _id: '507f1f77bcf86cd799439014',
        ...createDto,
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439014',
          ...createDto,
        }),
      };

      mockReclamoModel.mockImplementation(() => savedReclamo);

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted reclamos', async () => {
      const mockReclamos = [
        { _id: '1', descripcion: 'Reclamo 1', isDeleted: false },
        { _id: '2', descripcion: 'Reclamo 2', isDeleted: false },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamos);

      mockReclamoModel.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
        exec: execMock,
      });

      const result = await repository.findAll();

      expect(mockReclamoModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findOne', () => {
    it('should return a reclamo by id', async () => {
      const mockReclamo = {
        _id: '507f1f77bcf86cd799439011',
        descripcion: 'Test Reclamo',
        isDeleted: false,
      };

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamo);

      mockReclamoModel.findById.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockReclamo);
    });
  });

  describe('findBy', () => {
    it('should return reclamos matching filter', async () => {
      const filter = { estadoActual: 'Pendiente' };
      const mockReclamos = [
        { _id: '1', estadoActual: 'Pendiente', isDeleted: false },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamos);

      mockReclamoModel.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
        exec: execMock,
      });

      const result = await repository.findBy(filter);

      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findByCliente', () => {
    it('should return reclamos for a cliente', async () => {
      const clienteId = '507f1f77bcf86cd799439011';
      const mockReclamos = [
        { _id: '1', clienteId, isDeleted: false },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamos);

      mockReclamoModel.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
        exec: execMock,
      });

      const result = await repository.findByCliente(clienteId);

      expect(mockReclamoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          clienteId: expect.anything(),
        }),
      );
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findByProyecto', () => {
    it('should return reclamos for a proyecto', async () => {
      const proyectoId = '507f1f77bcf86cd799439012';
      const mockReclamos = [
        { _id: '1', proyectoId, isDeleted: false },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamos);

      mockReclamoModel.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
        exec: execMock,
      });

      const result = await repository.findByProyecto(proyectoId);

      expect(mockReclamoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          proyectoId: expect.anything(),
        }),
      );
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findByTipoProyecto', () => {
    it('should return reclamos for a tipo proyecto', async () => {
      const tipoProyectoId = '507f1f77bcf86cd799439013';
      const mockReclamos = [
        { _id: '1', tipoProyectoId, isDeleted: false },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamos);

      mockReclamoModel.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
        exec: execMock,
      });

      const result = await repository.findByTipoProyecto(tipoProyectoId);

      expect(mockReclamoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoProyectoId: expect.anything(),
        }),
      );
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findByArea', () => {
    it('should return reclamos for an area', async () => {
      const area = 'Soporte';
      const mockReclamos = [
        { _id: '1', area, isDeleted: false },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockReclamos);

      mockReclamoModel.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
        exec: execMock,
      });

      const result = await repository.findByArea(area);

      expect(mockReclamoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          areaActual: area,
        }),
      );
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('update', () => {
    it('should update a reclamo', async () => {
      const updateDto: UpdateReclamoDto = {
        descripcion: 'Updated Reclamo',
      };

      const updatedReclamo = {
        _id: '507f1f77bcf86cd799439011',
        ...updateDto,
      };

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(updatedReclamo);

      mockReclamoModel.findByIdAndUpdate.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedReclamo);
    });
  });

  describe('asignarArea', () => {
    it('should assign area to reclamo', async () => {
      const area = 'Soporte';
      const updatedReclamo = {
        _id: '507f1f77bcf86cd799439011',
        area,
      };

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(updatedReclamo);

      mockReclamoModel.findByIdAndUpdate.mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await repository.asignarArea('507f1f77bcf86cd799439011', area);

      expect(result).toEqual(updatedReclamo);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a reclamo', async () => {
      const execMock = jest.fn().mockResolvedValue({});
      mockReclamoModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      await repository.softDelete('507f1f77bcf86cd799439011');

      expect(mockReclamoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          estadoActual: 'CANCELADO',
          fechaCierre: expect.any(Date),
        },
      );
    });
  });
});
