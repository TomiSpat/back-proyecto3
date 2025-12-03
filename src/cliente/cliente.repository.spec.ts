import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClienteRepository } from './cliente.repository';
import { Cliente, ClienteDocument } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

describe('ClienteRepository', () => {
  let repository: ClienteRepository;
  let model: Model<ClienteDocument>;

  const mockClienteModel = jest.fn().mockReturnValue({}) as any;
  mockClienteModel.new = jest.fn();
  mockClienteModel.constructor = jest.fn();
  mockClienteModel.find = jest.fn();
  mockClienteModel.findOne = jest.fn();
  mockClienteModel.findOneAndUpdate = jest.fn();
  mockClienteModel.findByIdAndUpdate = jest.fn();
  mockClienteModel.save = jest.fn();
  mockClienteModel.exec = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteRepository,
        {
          provide: getModelToken(Cliente.name),
          useValue: mockClienteModel,
        },
      ],
    }).compile();

    repository = module.get<ClienteRepository>(ClienteRepository);
    model = module.get<Model<ClienteDocument>>(getModelToken(Cliente.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cliente', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Test Cliente',
        email: 'test@cliente.com',
        apellido: 'Test Apellido',
        numDocumento: '12345678',
        fechaNacimiento: '2023-01-01',
        numTelefono: '123456789',
      };

      const savedCliente = {
        _id: '507f1f77bcf86cd799439011',
        ...createDto,
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          ...createDto,
        }),
      };

      mockClienteModel.mockImplementation(() => savedCliente);

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted clientes', async () => {
      const mockClientes = [
        { _id: '1', nombre: 'Cliente 1', isDeleted: false },
        { _id: '2', nombre: 'Cliente 2', isDeleted: false },
      ];

      const execMock = jest.fn().mockResolvedValue(mockClientes);
      mockClienteModel.find.mockReturnValue({ exec: execMock });

      const result = await repository.findAll();

      expect(mockClienteModel.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toEqual(mockClientes);
    });

    it('should return clientes with filter', async () => {
      const filter = { nombre: 'Test' };
      const mockClientes = [
        { _id: '1', nombre: 'Test Cliente', isDeleted: false },
      ];

      const execMock = jest.fn().mockResolvedValue(mockClientes);
      mockClienteModel.find.mockReturnValue({ exec: execMock });

      const result = await repository.findAll(filter);

      expect(mockClienteModel.find).toHaveBeenCalledWith({
        ...filter,
        isDeleted: false,
      });
      expect(result).toEqual(mockClientes);
    });
  });

  describe('findOne', () => {
    it('should return a cliente by id', async () => {
      const mockCliente = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test Cliente',
        isDeleted: false,
      };

      const execMock = jest.fn().mockResolvedValue(mockCliente);
      mockClienteModel.findOne.mockReturnValue({ exec: execMock });

      const result = await repository.findOne('507f1f77bcf86cd799439011');

      expect(mockClienteModel.findOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
        isDeleted: false,
      });
      expect(result).toEqual(mockCliente);
    });

    it('should return null if cliente not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      mockClienteModel.findOne.mockReturnValue({ exec: execMock });

      const result = await repository.findOne('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findBy', () => {
    it('should return clientes matching filter', async () => {
      const filter = { email: 'test@cliente.com' };
      const mockClientes = [
        { _id: '1', email: 'test@cliente.com', isDeleted: false },
      ];

      const execMock = jest.fn().mockResolvedValue(mockClientes);
      mockClienteModel.find.mockReturnValue({ exec: execMock });

      const result = await repository.findBy(filter);

      expect(mockClienteModel.find).toHaveBeenCalledWith({
        ...filter,
        isDeleted: false,
      });
      expect(result).toEqual(mockClientes);
    });
  });

  describe('update', () => {
    it('should update a cliente', async () => {
      const updateDto: UpdateClienteDto = {
        nombre: 'Updated Cliente',
      };

      const updatedCliente = {
        _id: '507f1f77bcf86cd799439011',
        ...updateDto,
      };

      const execMock = jest.fn().mockResolvedValue(updatedCliente);
      mockClienteModel.findOneAndUpdate.mockReturnValue({ exec: execMock });

      const result = await repository.update('507f1f77bcf86cd799439011', updateDto);

      expect(mockClienteModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011', isDeleted: false },
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updatedCliente);
    });

    it('should return null if cliente to update not found', async () => {
      const updateDto: UpdateClienteDto = {
        nombre: 'Updated Cliente',
      };

      const execMock = jest.fn().mockResolvedValue(null);
      mockClienteModel.findOneAndUpdate.mockReturnValue({ exec: execMock });

      const result = await repository.update('nonexistent-id', updateDto);

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a cliente', async () => {
      const execMock = jest.fn().mockResolvedValue({});
      mockClienteModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

      await repository.softDelete('507f1f77bcf86cd799439011');

      expect(mockClienteModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      );
    });
  });
});
