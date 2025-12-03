import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoService } from './reclamo.service';
import { ReclamoRepository } from './reclamo.repository';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { AssignReclamoDto } from './dto/asignacion-area.dto';
import { AsignarReclamoPendienteDto } from './dto/asignar-reclamo-pendiente.dto';
import { AsignarResponsableDto } from './dto/asignar-responsable.dto';
import { ReclamoEstado, ReclamoPrioridad, ReclamoCriticidad, ReclamoTipo, AreaGeneralReclamo } from './reclamo.enums';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UsuarioRol } from '../usuario/usuario.enums';
import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';
import { UsuarioService } from '../usuario/usuario.service';

describe('ReclamoService', () => {
  let service: ReclamoService;
  let repository: ReclamoRepository;

  const mockReclamoRepository = {
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

  const mockEstadoReclamoService = {
    cambiarEstado: jest.fn(),
    registrarCambioArea: jest.fn(),
    registrarCambioResponsable: jest.fn(),
  };

  const mockUsuarioService = {
    validarAgenteDelArea: jest.fn(),
    findAgentesActivosByArea: jest.fn(),
  };

  const validObjectId = '507f1f77bcf86cd799439011';
  const invalidObjectId = 'invalid-id';
  const mockJwtUser: JwtUser = {
    id: validObjectId,
    email: 'test@test.com',
    rol: UsuarioRol.ADMIN,
    nombre: 'Test',
    apellido: 'User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReclamoService,
        {
          provide: ReclamoRepository,
          useValue: mockReclamoRepository,
        },
        {
          provide: EstadoReclamoService,
          useValue: mockEstadoReclamoService,
        },
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    service = module.get<ReclamoService>(ReclamoService);
    repository = module.get<ReclamoRepository>(ReclamoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new reclamo successfully as staff', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };

      const mockReclamo = { _id: validObjectId, ...createDto };
      mockReclamoRepository.create.mockResolvedValue(mockReclamo);

      const result = await service.create(createDto, mockJwtUser);

      expect(mockReclamoRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockReclamo);
    });

    it('should throw BadRequestException when user has invalid role', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
      };

      const invalidUser: JwtUser = {
        ...mockJwtUser,
        rol: 'invalid_role' as UsuarioRol,
      };

      await expect(service.create(createDto, invalidUser)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, invalidUser)).rejects.toThrow('no tiene un rol válido');
    });

    it('should create reclamo as cliente with automatic assignments', async () => {
      const clienteUser: JwtUser = {
        id: validObjectId,
        email: 'cliente@test.com',
        rol: UsuarioRol.CLIENTE,
        nombre: 'Cliente',
        apellido: 'Test',
        clienteId: validObjectId,
      };

      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo cliente',
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.CONSULTA,
      };

      const mockReclamo = { _id: validObjectId, ...createDto };
      mockReclamoRepository.create.mockResolvedValue(mockReclamo);

      const result = await service.create(createDto, clienteUser);

      expect(result).toEqual(mockReclamo);
    });

    it('should throw BadRequestException when cliente has no clienteId', async () => {
      const clienteUser: JwtUser = {
        id: validObjectId,
        email: 'cliente@test.com',
        rol: UsuarioRol.CLIENTE,
        nombre: 'Cliente',
        apellido: 'Test',
      };

      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.CONSULTA,
      };

      await expect(service.create(createDto, clienteUser)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, clienteUser)).rejects.toThrow('no tiene un cliente asociado');
    });

    it('should throw BadRequestException when staff creates without clienteId', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };

      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow('clienteId es obligatorio');
    });

    it('should throw BadRequestException when staff creates without prioridad', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        criticidad: ReclamoCriticidad.ALTA,
      };

      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow('prioridad es obligatorio');
    });

    it('should throw BadRequestException when staff creates without criticidad', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
      };

      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow('criticidad es obligatorio');
    });

    it('should create reclamo with EN_PROCESO state when area and responsable provided', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
        areaInicial: AreaGeneralReclamo.VENTAS,
        responsableId: validObjectId,
      };

      const mockReclamo = { _id: validObjectId, ...createDto, estadoActual: ReclamoEstado.EN_PROCESO };
      mockReclamoRepository.create.mockResolvedValue(mockReclamo);

      const result = await service.create(createDto, mockJwtUser);

      expect(result.estadoActual).toBe(ReclamoEstado.EN_PROCESO);
    });

    it('should throw BadRequestException on duplicate code error', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };

      const duplicateError = { code: 11000, message: 'Duplicate key' };
      mockReclamoRepository.create.mockRejectedValue(duplicateError);

      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow('Ya existe un reclamo con ese código');
    });

    it('should throw BadRequestException on other errors', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };

      const error = { message: 'Database error' };
      mockReclamoRepository.create.mockRejectedValue(error);

      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow(BadRequestException);
    });

    it('should rethrow BadRequestException from within create', async () => {
      const createDto: CreateReclamoDto = {
        descripcion: 'Test reclamo',
        clienteId: validObjectId,
        proyectoId: validObjectId,
        tipoProyectoId: validObjectId,
        tipo: ReclamoTipo.INCIDENTE,
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };

      mockReclamoRepository.create.mockRejectedValue(new BadRequestException('Custom error'));

      await expect(service.create(createDto, mockJwtUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all reclamos', async () => {
      const mockReclamos = [
        { _id: '1', descripcion: 'Reclamo 1' },
        { _id: '2', descripcion: 'Reclamo 2' },
      ];

      mockReclamoRepository.findAll.mockResolvedValue(mockReclamos);

      const result = await service.findAll();

      expect(mockReclamoRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockReclamos);
    });

    it('should return reclamos with filter', async () => {
      const filter = { estado: ReclamoEstado.PENDIENTE };
      const mockReclamos = [{ _id: '1', descripcion: 'Reclamo 1', estado: ReclamoEstado.PENDIENTE }];

      mockReclamoRepository.findAll.mockResolvedValue(mockReclamos);

      const result = await service.findAll(filter);

      expect(mockReclamoRepository.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findOne', () => {
    it('should return a reclamo by id', async () => {
      const mockReclamo = { _id: validObjectId, descripcion: 'Test reclamo' };
      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      const result = await service.findOne(validObjectId);

      expect(mockReclamoRepository.findOne).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockReclamo);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.findOne(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      mockReclamoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(validObjectId)).rejects.toThrow('No se encontró el reclamo');
    });
  });

  describe('findBy', () => {
    it('should return reclamos matching filter', async () => {
      const filter = { prioridad: ReclamoPrioridad.ALTA };
      const mockReclamos = [{ _id: '1', prioridad: ReclamoPrioridad.ALTA }];

      mockReclamoRepository.findBy.mockResolvedValue(mockReclamos);

      const result = await service.findBy(filter);

      expect(mockReclamoRepository.findBy).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('findByCliente', () => {
    it('should return reclamos by cliente', async () => {
      const mockReclamos = [{ _id: '1', clienteId: validObjectId }];
      mockReclamoRepository.findByCliente.mockResolvedValue(mockReclamos);

      const result = await service.findByCliente(validObjectId);

      expect(mockReclamoRepository.findByCliente).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockReclamos);
    });

    it('should throw BadRequestException for invalid cliente ObjectId', async () => {
      await expect(service.findByCliente(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.findByCliente(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });
  });

  describe('findByProyecto', () => {
    it('should return reclamos by proyecto', async () => {
      const mockReclamos = [{ _id: '1', proyectoId: validObjectId }];
      mockReclamoRepository.findByProyecto.mockResolvedValue(mockReclamos);

      const result = await service.findByProyecto(validObjectId);

      expect(mockReclamoRepository.findByProyecto).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockReclamos);
    });

    it('should throw BadRequestException for invalid proyecto ObjectId', async () => {
      await expect(service.findByProyecto(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.findByProyecto(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });
  });

  describe('findByTipoProyecto', () => {
    it('should return reclamos by tipo proyecto', async () => {
      const mockReclamos = [{ _id: '1', tipoProyectoId: validObjectId }];
      mockReclamoRepository.findByTipoProyecto.mockResolvedValue(mockReclamos);

      const result = await service.findByTipoProyecto(validObjectId);

      expect(mockReclamoRepository.findByTipoProyecto).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockReclamos);
    });

    it('should throw BadRequestException for invalid tipo proyecto ObjectId', async () => {
      await expect(service.findByTipoProyecto(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.findByTipoProyecto(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });
  });

  describe('findByArea', () => {
    it('should return reclamos by area', async () => {
      const area = AreaGeneralReclamo.VENTAS;
      const mockReclamos = [{ _id: '1', areaActual: area }];
      mockReclamoRepository.findByArea.mockResolvedValue(mockReclamos);

      const result = await service.findByArea(area);

      expect(mockReclamoRepository.findByArea).toHaveBeenCalledWith(area);
      expect(result).toEqual(mockReclamos);
    });
  });

  describe('update', () => {
    it('should update a reclamo successfully', async () => {
      const updateDto: UpdateReclamoDto = { descripcion: 'Updated description' };
      const mockReclamo = {
        _id: validObjectId,
        puedeModificar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };
      const updatedReclamo = { ...mockReclamo, ...updateDto };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);

      const result = await service.update(validObjectId, updateDto);

      expect(mockReclamoRepository.findOne).toHaveBeenCalledWith(validObjectId);
      expect(mockReclamoRepository.update).toHaveBeenCalledWith(validObjectId, updateDto);
      expect(result).toEqual(updatedReclamo);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const updateDto: UpdateReclamoDto = { descripcion: 'Updated' };

      await expect(service.update(invalidObjectId, updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(invalidObjectId, updateDto)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      const updateDto: UpdateReclamoDto = { descripcion: 'Updated' };
      mockReclamoRepository.findOne.mockResolvedValue(null);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(validObjectId, updateDto)).rejects.toThrow('No se encontró el reclamo');
    });

    it('should throw ForbiddenException when reclamo cannot be modified', async () => {
      const updateDto: UpdateReclamoDto = { descripcion: 'Updated' };
      const mockReclamo = {
        _id: validObjectId,
        puedeModificar: false,
        estadoActual: ReclamoEstado.RESUELTO,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(ForbiddenException);
      await expect(service.update(validObjectId, updateDto)).rejects.toThrow('No se puede modificar el reclamo');
    });

    it('should throw NotFoundException when update returns null', async () => {
      const updateDto: UpdateReclamoDto = { descripcion: 'Updated' };
      const mockReclamo = {
        _id: validObjectId,
        puedeModificar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(null);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('asignarArea', () => {
    it('should assign area successfully', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };
      const updatedReclamo = { ...mockReclamo, areaActual: assignDto.area, responsableActualId: assignDto.responsableId };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockUsuarioService.validarAgenteDelArea.mockResolvedValue(true);
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);
      mockEstadoReclamoService.registrarCambioArea.mockResolvedValue(undefined);
      mockEstadoReclamoService.registrarCambioResponsable.mockResolvedValue(undefined);

      const result = await service.asignarArea(validObjectId, assignDto);

      expect(mockReclamoRepository.findOne).toHaveBeenCalledWith(validObjectId);
      expect(mockUsuarioService.validarAgenteDelArea).toHaveBeenCalledWith(assignDto.responsableId, assignDto.area);
      expect(result).toEqual(updatedReclamo);
    });

    it('should assign area and responsable successfully', async () => {
      const assignDto: AssignReclamoDto = {
        area: AreaGeneralReclamo.VENTAS,
        responsableId: '507f1f77bcf86cd799439012',
      };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };
      const areaAssigned = { ...mockReclamo, areaActual: assignDto.area };
      const fullyUpdated = { ...areaAssigned, responsableActualId: assignDto.responsableId };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.asignarArea.mockResolvedValue(areaAssigned);
      mockReclamoRepository.update.mockResolvedValue(fullyUpdated);

      const result = await service.asignarArea(validObjectId, assignDto);

      expect(mockReclamoRepository.asignarArea).toHaveBeenCalledWith(validObjectId, assignDto.area);
      expect(mockReclamoRepository.update).toHaveBeenCalledWith(validObjectId, {
        responsableActualId: assignDto.responsableId,
      });
      expect(result).toEqual(fullyUpdated);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };

      await expect(service.asignarArea(invalidObjectId, assignDto)).rejects.toThrow(BadRequestException);
      await expect(service.asignarArea(invalidObjectId, assignDto)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };
      mockReclamoRepository.findOne.mockResolvedValue(null);

      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow(NotFoundException);
      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow('No se encontró el reclamo');
    });

    it('should throw ForbiddenException when reclamo cannot be reassigned', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: false,
        estadoActual: ReclamoEstado.RESUELTO,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow(ForbiddenException);
      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow('No se puede reasignar el reclamo');
    });

    it('should throw NotFoundException when update returns null', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockUsuarioService.validarAgenteDelArea.mockResolvedValue(true);
      mockReclamoRepository.update.mockResolvedValue(null);

      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when responsable is not from the area', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockUsuarioService.validarAgenteDelArea.mockResolvedValue(false);
      mockUsuarioService.findAgentesActivosByArea.mockResolvedValue([]);

      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow(BadRequestException);
      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow('no es un agente activo del área');
    });

    it('should include available agents in error message', async () => {
      const assignDto: AssignReclamoDto = { area: AreaGeneralReclamo.VENTAS, responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        estadoActual: ReclamoEstado.PENDIENTE,
      };
      const mockAgentes = [{ _id: 'agent1', nombre: 'Juan', apellido: 'Perez' }];

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockUsuarioService.validarAgenteDelArea.mockResolvedValue(false);
      mockUsuarioService.findAgentesActivosByArea.mockResolvedValue(mockAgentes);

      await expect(service.asignarArea(validObjectId, assignDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('asignarResponsable', () => {
    it('should assign responsable successfully', async () => {
      const asignarDto = { responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        estadoActual: ReclamoEstado.EN_PROCESO,
        responsableActualId: validObjectId,
        areaActual: AreaGeneralReclamo.VENTAS,
      };
      const updatedReclamo = { ...mockReclamo, responsableActualId: asignarDto.responsableId };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);
      mockEstadoReclamoService.registrarCambioResponsable.mockResolvedValue(undefined);

      const result = await service.asignarResponsable(validObjectId, asignarDto);

      expect(result).toEqual(updatedReclamo);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const asignarDto = { responsableId: '507f1f77bcf86cd799439012' };

      await expect(service.asignarResponsable(invalidObjectId, asignarDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      const asignarDto = { responsableId: '507f1f77bcf86cd799439012' };
      mockReclamoRepository.findOne.mockResolvedValue(null);

      await expect(service.asignarResponsable(validObjectId, asignarDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when reclamo cannot be reassigned', async () => {
      const asignarDto = { responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: false,
        estadoActual: ReclamoEstado.RESUELTO,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      await expect(service.asignarResponsable(validObjectId, asignarDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when same responsable', async () => {
      const asignarDto = { responsableId: validObjectId };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        responsableActualId: { toString: () => validObjectId },
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      await expect(service.asignarResponsable(validObjectId, asignarDto)).rejects.toThrow(BadRequestException);
      await expect(service.asignarResponsable(validObjectId, asignarDto)).rejects.toThrow('ya está asignado');
    });

    it('should throw NotFoundException when update returns null', async () => {
      const asignarDto = { responsableId: '507f1f77bcf86cd799439012' };
      const mockReclamo = {
        _id: validObjectId,
        puedeReasignar: true,
        responsableActualId: { toString: () => validObjectId },
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(null);

      await expect(service.asignarResponsable(validObjectId, asignarDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('asignarReclamoPendiente', () => {
    const coordinadorUser: JwtUser = {
      id: validObjectId,
      email: 'coordinador@test.com',
      rol: UsuarioRol.COORDINADOR,
      nombre: 'Coordinador',
      apellido: 'Test',
    };

    it('should assign pending reclamo successfully', async () => {
      const asignarDto = {
        area: AreaGeneralReclamo.VENTAS,
        responsableId: '507f1f77bcf86cd799439012',
        prioridad: ReclamoPrioridad.ALTA,
        criticidad: ReclamoCriticidad.ALTA,
      };
      const mockReclamo = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: undefined,
      };
      const updatedReclamo = { ...mockReclamo, areaActual: asignarDto.area, estadoActual: ReclamoEstado.EN_PROCESO };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);
      mockEstadoReclamoService.registrarCambioArea.mockResolvedValue(undefined);
      mockEstadoReclamoService.registrarCambioResponsable.mockResolvedValue(undefined);

      const result = await service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser);

      expect(result).toEqual(updatedReclamo);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };

      await expect(service.asignarReclamoPendiente(invalidObjectId, asignarDto, coordinadorUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user is not coordinador or admin', async () => {
      const agenteUser: JwtUser = {
        ...mockJwtUser,
        rol: UsuarioRol.AGENTE,
      };
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };

      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, agenteUser)).rejects.toThrow(ForbiddenException);
      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, agenteUser)).rejects.toThrow('Solo los coordinadores');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };
      mockReclamoRepository.findOne.mockResolvedValue(null);

      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when reclamo is not pending', async () => {
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };
      const mockReclamo = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.EN_PROCESO,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser)).rejects.toThrow(BadRequestException);
      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser)).rejects.toThrow('ya ha sido asignado');
    });

    it('should throw BadRequestException when reclamo already has area', async () => {
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };
      const mockReclamo = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: AreaGeneralReclamo.FACTURACION,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser)).rejects.toThrow(BadRequestException);
      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser)).rejects.toThrow('ya tiene un área asignada');
    });

    it('should throw NotFoundException when update returns null', async () => {
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };
      const mockReclamo = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: undefined,
      };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(null);

      await expect(service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser)).rejects.toThrow(NotFoundException);
    });

    it('should assign reclamo without responsable', async () => {
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };
      const mockReclamo = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: undefined,
      };
      const updatedReclamo = { ...mockReclamo, areaActual: asignarDto.area, estadoActual: ReclamoEstado.EN_PROCESO };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);
      mockEstadoReclamoService.registrarCambioArea.mockResolvedValue(undefined);

      const result = await service.asignarReclamoPendiente(validObjectId, asignarDto, coordinadorUser);

      expect(result).toEqual(updatedReclamo);
      expect(mockEstadoReclamoService.registrarCambioResponsable).not.toHaveBeenCalled();
    });

    it('should allow admin to assign pending reclamo', async () => {
      const adminUser: JwtUser = {
        ...mockJwtUser,
        rol: UsuarioRol.ADMIN,
      };
      const asignarDto = { area: AreaGeneralReclamo.VENTAS };
      const mockReclamo = {
        _id: validObjectId,
        estadoActual: ReclamoEstado.PENDIENTE,
        areaActual: undefined,
      };
      const updatedReclamo = { ...mockReclamo, areaActual: asignarDto.area };

      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);
      mockEstadoReclamoService.registrarCambioArea.mockResolvedValue(undefined);

      const result = await service.asignarReclamoPendiente(validObjectId, asignarDto, adminUser);

      expect(result).toEqual(updatedReclamo);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a reclamo successfully', async () => {
      const mockReclamo = { _id: validObjectId, descripcion: 'Test' };
      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);
      mockReclamoRepository.softDelete.mockResolvedValue(undefined);

      await service.softDelete(validObjectId);

      expect(mockReclamoRepository.findOne).toHaveBeenCalledWith(validObjectId);
      expect(mockReclamoRepository.softDelete).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.softDelete(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.softDelete(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when reclamo not found', async () => {
      mockReclamoRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete(validObjectId)).rejects.toThrow(NotFoundException);
      await expect(service.softDelete(validObjectId)).rejects.toThrow('No se encontró el reclamo');
    });
  });
});
