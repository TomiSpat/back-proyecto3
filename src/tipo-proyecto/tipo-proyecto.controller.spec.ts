import { Test, TestingModule } from '@nestjs/testing';
import { TipoProyectoController } from './tipo-proyecto.controller';
import { TipoProyectoService } from './tipo-proyecto.service';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

describe('TipoProyectoController', () => {
  let controller: TipoProyectoController;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockTipoProyectoService = {
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
      controllers: [TipoProyectoController],
      providers: [
        {
          provide: TipoProyectoService,
          useValue: mockTipoProyectoService,
        },
      ],
    }).compile();

    controller = module.get<TipoProyectoController>(TipoProyectoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a tipo proyecto', async () => {
      const createDto: CreateTipoProyectoDto = {
        nombre: 'Test Tipo',
        descripcion: 'Descripcion del tipo',
      };
      const mockTipoProyecto = { _id: validObjectId, ...createDto };
      mockTipoProyectoService.create.mockResolvedValue(mockTipoProyecto);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTipoProyecto);
      expect(mockTipoProyectoService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all tipo proyectos', async () => {
      const mockTipoProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockTipoProyectoService.findAll.mockResolvedValue(mockTipoProyectos);

      const result = await controller.findAll();

      expect(result).toEqual(mockTipoProyectos);
    });

    it('should return tipo proyectos with filter', async () => {
      const filter = { nombre: 'Test' };
      const mockTipoProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockTipoProyectoService.findAll.mockResolvedValue(mockTipoProyectos);

      const result = await controller.findAll(filter);

      expect(result).toEqual(mockTipoProyectos);
      expect(mockTipoProyectoService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findBy', () => {
    it('should return tipo proyectos matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockTipoProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockTipoProyectoService.findBy.mockResolvedValue(mockTipoProyectos);

      const result = await controller.findBy(filter);

      expect(result).toEqual(mockTipoProyectos);
      expect(mockTipoProyectoService.findBy).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a tipo proyecto by id', async () => {
      const mockTipoProyecto = { _id: validObjectId, nombre: 'Test' };
      mockTipoProyectoService.findOne.mockResolvedValue(mockTipoProyecto);

      const result = await controller.findOne(validObjectId);

      expect(result).toEqual(mockTipoProyecto);
      expect(mockTipoProyectoService.findOne).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('update', () => {
    it('should update a tipo proyecto', async () => {
      const updateDto: UpdateTipoProyectoDto = { nombre: 'Updated' };
      const mockTipoProyecto = { _id: validObjectId, nombre: 'Updated' };
      mockTipoProyectoService.update.mockResolvedValue(mockTipoProyecto);

      const result = await controller.update(validObjectId, updateDto);

      expect(result).toEqual(mockTipoProyecto);
      expect(mockTipoProyectoService.update).toHaveBeenCalledWith(validObjectId, updateDto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a tipo proyecto', async () => {
      mockTipoProyectoService.softDelete.mockResolvedValue(undefined);

      await controller.softDelete(validObjectId);

      expect(mockTipoProyectoService.softDelete).toHaveBeenCalledWith(validObjectId);
    });
  });
});
