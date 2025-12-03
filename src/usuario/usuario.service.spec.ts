import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioRepository } from './usuario.repository';
import { ClienteRepository } from '../cliente/cliente.repository';
import { UsuarioRol } from './usuario.enums';
import { AreaGeneralReclamo } from '../reclamo/reclamo.enums';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsuarioService', () => {
  let service: UsuarioService;

  const validObjectId = '507f1f77bcf86cd799439011';
  const invalidObjectId = 'invalid-id';

  const mockUsuarioRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findByRol: jest.fn(),
    findByArea: jest.fn(),
    findAgentesActivosByArea: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    updateUltimoAcceso: jest.fn(),
  };

  const mockClienteRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    updateUsuarioId: jest.fn(),
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: UsuarioRepository,
          useValue: mockUsuarioRepository,
        },
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException when email already exists', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        password: 'password123',
        rol: UsuarioRol.ADMIN,
      };
      mockUsuarioRepository.findByEmail.mockResolvedValue({ _id: validObjectId });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Ya existe un usuario con el email');
    });

    it('should throw BadRequestException when agente has no areaAsignada', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        password: 'password123',
        rol: UsuarioRol.AGENTE,
      };
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('Los usuarios con rol "agente" deben tener un área asignada');
    });

    it('should throw BadRequestException when cliente missing required fields', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        password: 'password123',
        rol: UsuarioRol.CLIENTE,
      };
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('Los usuarios con rol "cliente" deben proporcionar');
    });

    it('should create admin user successfully', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@test.com',
        password: 'password123',
        rol: UsuarioRol.ADMIN,
      };
      const mockUser = { _id: validObjectId, ...createDto, password: 'hashedPassword' };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create agente user with areaAsignada', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Agente',
        apellido: 'User',
        email: 'agente@test.com',
        password: 'password123',
        rol: UsuarioRol.AGENTE,
        areaAsignada: AreaGeneralReclamo.SOPORTE_TECNICO,
      };
      const mockUser = { _id: validObjectId, ...createDto };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException on duplicate key error', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@test.com',
        password: 'password123',
        rol: UsuarioRol.ADMIN,
      };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.create.mockRejectedValue({ code: 11000 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on other errors', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@test.com',
        password: 'password123',
        rol: UsuarioRol.ADMIN,
      };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should create cliente user with transaction when cliente does not exist', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Cliente',
        apellido: 'User',
        email: 'cliente@test.com',
        password: 'password123',
        rol: UsuarioRol.CLIENTE,
        numDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        numTelefono: '1234567890',
      };
      const mockCliente = { _id: validObjectId };
      const mockUser = { _id: '507f1f77bcf86cd799439012', ...createDto };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.create.mockResolvedValue(mockCliente);
      mockUsuarioRepository.create.mockResolvedValue(mockUser);
      mockClienteRepository.updateUsuarioId.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result).toEqual(mockUser);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should create cliente user using existing cliente', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Cliente',
        apellido: 'User',
        email: 'cliente@test.com',
        password: 'password123',
        rol: UsuarioRol.CLIENTE,
        numDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        numTelefono: '1234567890',
      };
      const existingCliente = { _id: validObjectId, usuarioId: null };
      const mockUser = { _id: '507f1f77bcf86cd799439012', ...createDto };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.findByEmail.mockResolvedValue(existingCliente);
      mockUsuarioRepository.create.mockResolvedValue(mockUser);
      mockClienteRepository.updateUsuarioId.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when cliente already has usuario', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Cliente',
        apellido: 'User',
        email: 'cliente@test.com',
        password: 'password123',
        rol: UsuarioRol.CLIENTE,
        numDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        numTelefono: '1234567890',
      };
      const existingCliente = { _id: validObjectId, usuarioId: '507f1f77bcf86cd799439012' };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.findByEmail.mockResolvedValue(existingCliente);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    it('should abort transaction on duplicate key error during cliente creation', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Cliente',
        apellido: 'User',
        email: 'cliente@test.com',
        password: 'password123',
        rol: UsuarioRol.CLIENTE,
        numDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        numTelefono: '1234567890',
      };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.create.mockRejectedValue({ code: 11000 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    it('should abort transaction on general error during cliente creation', async () => {
      const createDto: CreateUsuarioDto = {
        nombre: 'Cliente',
        apellido: 'User',
        email: 'cliente@test.com',
        password: 'password123',
        rol: UsuarioRol.CLIENTE,
        numDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        numTelefono: '1234567890',
      };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.findByEmail.mockResolvedValue(null);
      mockClienteRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all usuarios', async () => {
      const mockUsers = [{ _id: validObjectId, nombre: 'Test' }];
      mockUsuarioRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsuarioRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return usuarios with filter', async () => {
      const filter = { rol: UsuarioRol.ADMIN };
      const mockUsers = [{ _id: validObjectId, rol: UsuarioRol.ADMIN }];
      mockUsuarioRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll(filter);

      expect(result).toEqual(mockUsers);
      expect(mockUsuarioRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a usuario by id', async () => {
      const mockUser = { _id: validObjectId, nombre: 'Test' };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(validObjectId);

      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.findOne(invalidObjectId)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(invalidObjectId)).rejects.toThrow('no es un ObjectId válido');
    });

    it('should throw NotFoundException when usuario not found', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(validObjectId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a usuario by email', async () => {
      const mockUser = { _id: validObjectId, email: 'test@test.com' };
      mockUsuarioRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when email not found', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('notfound@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRol', () => {
    it('should return usuarios by rol', async () => {
      const mockUsers = [{ _id: validObjectId, rol: UsuarioRol.AGENTE }];
      mockUsuarioRepository.findByRol.mockResolvedValue(mockUsers);

      const result = await service.findByRol(UsuarioRol.AGENTE);

      expect(result).toEqual(mockUsers);
      expect(mockUsuarioRepository.findByRol).toHaveBeenCalledWith(UsuarioRol.AGENTE);
    });
  });

  describe('findByArea', () => {
    it('should return usuarios by area', async () => {
      const mockUsers = [{ _id: validObjectId, areaAsignada: 'VENTAS' }];
      mockUsuarioRepository.findByArea.mockResolvedValue(mockUsers);

      const result = await service.findByArea('VENTAS');

      expect(result).toEqual(mockUsers);
      expect(mockUsuarioRepository.findByArea).toHaveBeenCalledWith('VENTAS');
    });
  });

  describe('findAgentesActivosByArea', () => {
    it('should return active agentes by area', async () => {
      const mockAgentes = [{ _id: validObjectId, rol: UsuarioRol.AGENTE, estado: 'activo' }];
      mockUsuarioRepository.findAgentesActivosByArea.mockResolvedValue(mockAgentes);

      const result = await service.findAgentesActivosByArea('SOPORTE_TECNICO');

      expect(result).toEqual(mockAgentes);
      expect(mockUsuarioRepository.findAgentesActivosByArea).toHaveBeenCalledWith('SOPORTE_TECNICO');
    });
  });

  describe('validarAgenteDelArea', () => {
    it('should return false for invalid ObjectId', async () => {
      const result = await service.validarAgenteDelArea(invalidObjectId, 'VENTAS');

      expect(result).toBe(false);
    });

    it('should return false when usuario not found', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      const result = await service.validarAgenteDelArea(validObjectId, 'VENTAS');

      expect(result).toBe(false);
    });

    it('should return true when usuario is active agente of the area', async () => {
      const mockUser = {
        _id: validObjectId,
        rol: UsuarioRol.AGENTE,
        areaAsignada: 'VENTAS',
        estado: 'activo',
        isDeleted: false,
      };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validarAgenteDelArea(validObjectId, 'VENTAS');

      expect(result).toBe(true);
    });

    it('should return false when usuario is not agente', async () => {
      const mockUser = {
        _id: validObjectId,
        rol: UsuarioRol.ADMIN,
        areaAsignada: 'VENTAS',
        estado: 'activo',
        isDeleted: false,
      };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validarAgenteDelArea(validObjectId, 'VENTAS');

      expect(result).toBe(false);
    });

    it('should return false when usuario is from different area', async () => {
      const mockUser = {
        _id: validObjectId,
        rol: UsuarioRol.AGENTE,
        areaAsignada: 'FACTURACION',
        estado: 'activo',
        isDeleted: false,
      };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validarAgenteDelArea(validObjectId, 'VENTAS');

      expect(result).toBe(false);
    });

    it('should return false when usuario is not active', async () => {
      const mockUser = {
        _id: validObjectId,
        rol: UsuarioRol.AGENTE,
        areaAsignada: 'VENTAS',
        estado: 'inactivo',
        isDeleted: false,
      };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validarAgenteDelArea(validObjectId, 'VENTAS');

      expect(result).toBe(false);
    });

    it('should return false when usuario is deleted', async () => {
      const mockUser = {
        _id: validObjectId,
        rol: UsuarioRol.AGENTE,
        areaAsignada: 'VENTAS',
        estado: 'activo',
        isDeleted: true,
      };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validarAgenteDelArea(validObjectId, 'VENTAS');

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update usuario successfully', async () => {
      const updateDto: UpdateUsuarioDto = { nombre: 'Updated' };
      const mockUser = { _id: validObjectId, nombre: 'Updated' };
      mockUsuarioRepository.update.mockResolvedValue(mockUser);

      const result = await service.update(validObjectId, updateDto);

      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const updateDto: UpdateUsuarioDto = { nombre: 'Updated' };

      await expect(service.update(invalidObjectId, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when usuario not found', async () => {
      const updateDto: UpdateUsuarioDto = { nombre: 'Updated' };
      mockUsuarioRepository.update.mockResolvedValue(null);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const updateDto: UpdateUsuarioDto = { email: 'existing@test.com' };
      const existingUser = { _id: '507f1f77bcf86cd799439012' };
      mockUsuarioRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.update(validObjectId, updateDto)).rejects.toThrow(ConflictException);
    });

    it('should allow updating email to same email', async () => {
      const updateDto: UpdateUsuarioDto = { email: 'same@test.com' };
      const existingUser = { _id: validObjectId };
      const mockUser = { _id: validObjectId, email: 'same@test.com' };
      
      mockUsuarioRepository.findByEmail.mockResolvedValue(existingUser);
      mockUsuarioRepository.update.mockResolvedValue(mockUser);

      const result = await service.update(validObjectId, updateDto);

      expect(result).toEqual(mockUser);
    });

    it('should hash password when updating', async () => {
      const updateDto: UpdateUsuarioDto = { password: 'newPassword123' };
      const mockUser = { _id: validObjectId };
      
      mockUsuarioRepository.update.mockResolvedValue(mockUser);

      await service.update(validObjectId, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });
  });

  describe('softDelete', () => {
    it('should soft delete usuario successfully', async () => {
      const mockUser = { _id: validObjectId };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUser);
      mockUsuarioRepository.softDelete.mockResolvedValue(undefined);

      await service.softDelete(validObjectId);

      expect(mockUsuarioRepository.softDelete).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      await expect(service.softDelete(invalidObjectId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when usuario not found', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete(validObjectId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUser', () => {
    it('should return null when usuario not found', async () => {
      mockUsuarioRepository.findByEmailWithPassword.mockResolvedValue(null);

      const result = await service.validateUser('notfound@test.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = { _id: validObjectId, email: 'test@test.com', password: 'hashedPassword' };
      mockUsuarioRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@test.com', 'wrongPassword');

      expect(result).toBeNull();
    });

    it('should return usuario when credentials are valid', async () => {
      const mockUser = { _id: validObjectId, email: 'test@test.com', password: 'hashedPassword' };
      mockUsuarioRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'correctPassword');

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUltimoAcceso', () => {
    it('should update ultimo acceso', async () => {
      mockUsuarioRepository.updateUltimoAcceso.mockResolvedValue(undefined);

      await service.updateUltimoAcceso(validObjectId);

      expect(mockUsuarioRepository.updateUltimoAcceso).toHaveBeenCalledWith(validObjectId);
    });
  });
});
