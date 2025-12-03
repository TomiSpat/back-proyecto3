import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioRol } from './usuario.enums';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockUsuarioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    findByRol: jest.fn(),
    findByArea: jest.fn(),
    findAgentesActivosByArea: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a usuario', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        password: 'password123',
        rol: UsuarioRol.ADMIN,
      };
      const mockUser = { _id: validObjectId, ...createDto };
      mockUsuarioService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockUser);
      expect(mockUsuarioService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all usuarios', async () => {
      const mockUsers = [{ _id: validObjectId, nombre: 'Test' }];
      mockUsuarioService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('findByRol', () => {
    it('should return usuarios by rol', async () => {
      const mockUsers = [{ _id: validObjectId, rol: UsuarioRol.AGENTE }];
      mockUsuarioService.findByRol.mockResolvedValue(mockUsers);

      const result = await controller.findByRol(UsuarioRol.AGENTE);

      expect(result).toEqual(mockUsers);
      expect(mockUsuarioService.findByRol).toHaveBeenCalledWith(UsuarioRol.AGENTE);
    });
  });

  describe('findByArea', () => {
    it('should return usuarios by area', async () => {
      const mockUsers = [{ _id: validObjectId, areaAsignada: 'VENTAS' }];
      mockUsuarioService.findByArea.mockResolvedValue(mockUsers);

      const result = await controller.findByArea('VENTAS');

      expect(result).toEqual(mockUsers);
      expect(mockUsuarioService.findByArea).toHaveBeenCalledWith('VENTAS');
    });
  });

  describe('findAgentesActivosByArea', () => {
    it('should return active agentes by area', async () => {
      const mockAgentes = [{ _id: validObjectId, rol: UsuarioRol.AGENTE }];
      mockUsuarioService.findAgentesActivosByArea.mockResolvedValue(mockAgentes);

      const result = await controller.findAgentesActivosByArea('SOPORTE_TECNICO');

      expect(result).toEqual(mockAgentes);
      expect(mockUsuarioService.findAgentesActivosByArea).toHaveBeenCalledWith('SOPORTE_TECNICO');
    });
  });

  describe('findOne', () => {
    it('should return a usuario by id', async () => {
      const mockUser = { _id: validObjectId, nombre: 'Test' };
      mockUsuarioService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(validObjectId);

      expect(result).toEqual(mockUser);
      expect(mockUsuarioService.findOne).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('update', () => {
    it('should update a usuario', async () => {
      const updateDto: UpdateUsuarioDto = { nombre: 'Updated' };
      const mockUser = { _id: validObjectId, nombre: 'Updated' };
      mockUsuarioService.update.mockResolvedValue(mockUser);

      const result = await controller.update(validObjectId, updateDto);

      expect(result).toEqual(mockUser);
      expect(mockUsuarioService.update).toHaveBeenCalledWith(validObjectId, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a usuario', async () => {
      mockUsuarioService.softDelete.mockResolvedValue(undefined);

      const result = await controller.remove(validObjectId);

      expect(mockUsuarioService.softDelete).toHaveBeenCalledWith(validObjectId);
    });
  });
});
