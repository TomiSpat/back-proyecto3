import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoController } from './reclamo.controller';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { AssignReclamoDto } from './dto/asignacion-area.dto';
import { ReclamoEstado, ReclamoPrioridad, ReclamoCriticidad, ReclamoTipo, AreaGeneralReclamo } from './reclamo.enums';

describe('ReclamoController', () => {
  let controller: ReclamoController;
  let service: ReclamoService;

  const mockReclamoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    findByCliente: jest.fn(),
    findByProyecto: jest.fn(),
    findByTipoProyecto: jest.fn(),
    findByArea: jest.fn(),
    update: jest.fn(),
    asignarArea: jest.fn(),
    softDelete: jest.fn(),
  };

  const validObjectId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamoController],
      providers: [
        {
          provide: ReclamoService,
          useValue: mockReclamoService,
        },
      ],
    }).compile();

    controller = module.get<ReclamoController>(ReclamoController);
    service = module.get<ReclamoService>(ReclamoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reclamo', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };

      const expectedResult = { _id: validObjectId, ...createDto };
      mockReclamoService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(mockReclamoService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all reclamos', async () => {
      const expectedResult = [
        { _id: '1', descripcion: 'Reclamo 1' },
        { _id: '2', descripcion: 'Reclamo 2' },
      ];

      mockReclamoService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockReclamoService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should return reclamos with filter', async () => {
      const filter = { estado: ReclamoEstado.PENDIENTE };
      const expectedResult = [{ _id: '1', estado: ReclamoEstado.PENDIENTE }];

      mockReclamoService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filter);

      expect(mockReclamoService.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findBy', () => {
    it('should return reclamos matching custom filter', async () => {
      const filter = { prioridad: ReclamoPrioridad.ALTA };
      const expectedResult = [{ _id: '1', prioridad: ReclamoPrioridad.ALTA }];

      mockReclamoService.findBy.mockResolvedValue(expectedResult);

      const result = await controller.findBy(filter);

      expect(mockReclamoService.findBy).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByCliente', () => {
    it('should return reclamos by cliente', async () => {
      const expectedResult = [{ _id: '1', clienteId: validObjectId }];
      mockReclamoService.findByCliente.mockResolvedValue(expectedResult);

      const result = await controller.findByCliente(validObjectId);

      expect(mockReclamoService.findByCliente).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByProyecto', () => {
    it('should return reclamos by proyecto', async () => {
      const expectedResult = [{ _id: '1', proyectoId: validObjectId }];
      mockReclamoService.findByProyecto.mockResolvedValue(expectedResult);

      const result = await controller.findByProyecto(validObjectId);

      expect(mockReclamoService.findByProyecto).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByTipoProyecto', () => {
    it('should return reclamos by tipo proyecto', async () => {
      const expectedResult = [{ _id: '1', tipoProyectoId: validObjectId }];
      mockReclamoService.findByTipoProyecto.mockResolvedValue(expectedResult);

      const result = await controller.findByTipoProyecto(validObjectId);

      expect(mockReclamoService.findByTipoProyecto).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByArea', () => {
    it('should return reclamos by area', async () => {
      const area = AreaGeneralReclamo.VENTAS;
      const expectedResult = [{ _id: '1', areaActual: area }];
      mockReclamoService.findByArea.mockResolvedValue(expectedResult);

      const result = await controller.findByArea(area);

      expect(mockReclamoService.findByArea).toHaveBeenCalledWith(area);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a reclamo by id', async () => {
      const expectedResult = { _id: validObjectId, descripcion: 'Test reclamo' };
      mockReclamoService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(validObjectId);

      expect(mockReclamoService.findOne).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a reclamo', async () => {
      const updateDto: UpdateReclamoDto = { descripcion: 'Updated description' };
      const expectedResult = { _id: validObjectId, descripcion: 'Updated description' };

      mockReclamoService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(validObjectId, updateDto);

      expect(mockReclamoService.update).toHaveBeenCalledWith(validObjectId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('asignarArea', () => {
    it('should assign area to a reclamo', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS };
      const expectedResult = {
        _id: validObjectId,
        areaActual: AreaGeneralReclamo.VENTAS,
      };

      mockReclamoService.asignarArea.mockResolvedValue(expectedResult);

      const result = await controller.asignarArea(validObjectId, assignDto);

      expect(mockReclamoService.asignarArea).toHaveBeenCalledWith(validObjectId, assignDto);
      expect(result).toEqual(expectedResult);
    });

    it('should assign area and responsable to a reclamo', async () => {
      const assignDto: AssignReclamoDto = {
        area: AreaGeneralReclamo.VENTAS,
        responsableId: '507f1f77bcf86cd799439012',
      };
      const expectedResult = {
        _id: validObjectId,
        areaActual: AreaGeneralReclamo.VENTAS,
        responsableActualId: '507f1f77bcf86cd799439012',
      };

      mockReclamoService.asignarArea.mockResolvedValue(expectedResult);

      const result = await controller.asignarArea(validObjectId, assignDto);

      expect(mockReclamoService.asignarArea).toHaveBeenCalledWith(validObjectId, assignDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a reclamo', async () => {
      mockReclamoService.softDelete.mockResolvedValue(undefined);

      const result = await controller.softDelete(validObjectId);

      expect(mockReclamoService.softDelete).toHaveBeenCalledWith(validObjectId);
      expect(result).toBeUndefined();
    });
  });
});
