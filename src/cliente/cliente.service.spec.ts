import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from './cliente.service';
import { ClienteRepository } from './cliente.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

describe('ClienteService', () => {
  let service: ClienteService;
  let repository: ClienteRepository;

  const mockClienteRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
    repository = module.get<ClienteRepository>(ClienteRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cliente', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Test Cliente',
        email: 'test@cliente.com',
        numTelefono: '123456789',
        apellido: 'Test Apellido',
        numDocumento: '12345678',
        fechaNacimiento: '2023-01-01',
      };

      const mockCliente: any = {
        _id: '507f1f77bcf86cd799439011',
        ...createDto,
      };

      mockClienteRepository.create.mockResolvedValue(mockCliente);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCliente);
      expect(mockClienteRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all clientes', async () => {
      const mockClientes: any[] = [
        { _id: '1', nombre: 'Cliente 1' },
        { _id: '2', nombre: 'Cliente 2' },
      ];

      mockClienteRepository.findAll.mockResolvedValue(mockClientes);

      const result = await service.findAll();

      expect(result).toEqual(mockClientes);
      expect(mockClienteRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return clientes with filter', async () => {
      const filter = { nombre: 'Test' };
      const mockClientes: any[] = [{ _id: '1', nombre: 'Test Cliente' }];

      mockClienteRepository.findAll.mockResolvedValue(mockClientes);

      const result = await service.findAll(filter);

      expect(result).toEqual(mockClientes);
      expect(mockClienteRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a cliente by id', async () => {
      const mockCliente: any = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test Cliente',
      };

      mockClienteRepository.findOne.mockResolvedValue(mockCliente);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCliente);
      expect(mockClienteRepository.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when cliente not found', async () => {
      mockClienteRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Cliente con ID nonexistent-id no encontrado',
      );
    });
  });

  describe('findBy', () => {
    it('should return clientes matching filter', async () => {
      const filter = { email: 'test@cliente.com' };
      const mockClientes: any[] = [
        { _id: '1', email: 'test@cliente.com' },
      ];

      mockClienteRepository.findBy.mockResolvedValue(mockClientes);

      const result = await service.findBy(filter);

      expect(result).toEqual(mockClientes);
      expect(mockClienteRepository.findBy).toHaveBeenCalledWith(filter);
    });
  });

  describe('update', () => {
    it('should update a cliente', async () => {
      const updateDto: UpdateClienteDto = {
        nombre: 'Updated Cliente',
      };

      const mockCliente: any = {
        _id: '507f1f77bcf86cd799439011',
        ...updateDto,
      };

      mockClienteRepository.update.mockResolvedValue(mockCliente);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(mockCliente);
      expect(mockClienteRepository.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
    });

    it('should throw NotFoundException when updating non-existent cliente', async () => {
      const updateDto: UpdateClienteDto = {
        nombre: 'Updated Cliente',
      };

      mockClienteRepository.update.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a cliente', async () => {
      const mockCliente: any = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test Cliente',
      };

      mockClienteRepository.findOne.mockResolvedValue(mockCliente);
      mockClienteRepository.softDelete.mockResolvedValue(undefined);

      await service.softDelete('507f1f77bcf86cd799439011');

      expect(mockClienteRepository.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockClienteRepository.softDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when deleting non-existent cliente', async () => {
      mockClienteRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
