import { Test, TestingModule } from '@nestjs/testing';
import { ProyectoController } from './proyecto.controller';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

describe('ProyectoController', () => {
  let controller: ProyectoController;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockProyectoService = {
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
      controllers: [ProyectoController],
      providers: [
        {
          provide: ProyectoService,
          useValue: mockProyectoService,
        },
      ],
    }).compile();

    controller = module.get<ProyectoController>(ProyectoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a proyecto', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Test Proyecto',
        descripcion: 'Descripcion del proyecto de test',
        clienteId: validObjectId,
        tipoProyectoId: validObjectId,
        fechaInicio: '2024-01-01',
      };
      const mockProyecto = { _id: validObjectId, ...createDto };
      mockProyectoService.create.mockResolvedValue(mockProyecto);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockProyecto);
      expect(mockProyectoService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all proyectos', async () => {
      const mockProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockProyectoService.findAll.mockResolvedValue(mockProyectos);

      const result = await controller.findAll();

      expect(result).toEqual(mockProyectos);
    });

    it('should return proyectos with filter', async () => {
      const filter = { nombre: 'Test' };
      const mockProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockProyectoService.findAll.mockResolvedValue(mockProyectos);

      const result = await controller.findAll(filter);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findBy', () => {
    it('should return proyectos matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockProyectos = [{ _id: validObjectId, nombre: 'Test' }];
      mockProyectoService.findBy.mockResolvedValue(mockProyectos);

      const result = await controller.findBy(filter);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoService.findBy).toHaveBeenCalledWith(filter);
    });
  });

  describe('findByCliente', () => {
    it('should return proyectos by cliente', async () => {
      const mockProyectos = [{ _id: validObjectId, clienteId: validObjectId }];
      mockProyectoService.findByCliente.mockResolvedValue(mockProyectos);

      const result = await controller.findByCliente(validObjectId);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoService.findByCliente).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('findByTipoProyecto', () => {
    it('should return proyectos by tipo proyecto', async () => {
      const mockProyectos = [{ _id: validObjectId, tipoProyectoId: validObjectId }];
      mockProyectoService.findByTipoProyecto.mockResolvedValue(mockProyectos);

      const result = await controller.findByTipoProyecto(validObjectId);

      expect(result).toEqual(mockProyectos);
      expect(mockProyectoService.findByTipoProyecto).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('findOne', () => {
    it('should return a proyecto by id', async () => {
      const mockProyecto = { _id: validObjectId, nombre: 'Test' };
      mockProyectoService.findOne.mockResolvedValue(mockProyecto);

      const result = await controller.findOne(validObjectId);

      expect(result).toEqual(mockProyecto);
      expect(mockProyectoService.findOne).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('update', () => {
    it('should update a proyecto', async () => {
      const updateDto: UpdateProyectoDto = { nombre: 'Updated' };
      const mockProyecto = { _id: validObjectId, nombre: 'Updated' };
      mockProyectoService.update.mockResolvedValue(mockProyecto);

      const result = await controller.update(validObjectId, updateDto);

      expect(result).toEqual(mockProyecto);
      expect(mockProyectoService.update).toHaveBeenCalledWith(validObjectId, updateDto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a proyecto', async () => {
      mockProyectoService.softDelete.mockResolvedValue(undefined);

      await controller.softDelete(validObjectId);

      expect(mockProyectoService.softDelete).toHaveBeenCalledWith(validObjectId);
    });
  });
});
