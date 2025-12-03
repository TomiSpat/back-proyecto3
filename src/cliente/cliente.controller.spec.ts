import { Test, TestingModule } from '@nestjs/testing';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

describe('ClienteController', () => {
  let controller: ClienteController;

  const validObjectId = '507f1f77bcf86cd799439011';

  const mockClienteService = {
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
      controllers: [ClienteController],
      providers: [
        {
          provide: ClienteService,
          useValue: mockClienteService,
        },
      ],
    }).compile();

    controller = module.get<ClienteController>(ClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cliente', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Test',
        apellido: 'Cliente',
        email: 'test@test.com',
        numDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        numTelefono: '1234567890',
      };
      const mockCliente = { _id: validObjectId, ...createDto };
      mockClienteService.create.mockResolvedValue(mockCliente);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCliente);
      expect(mockClienteService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all clientes', async () => {
      const mockClientes = [{ _id: validObjectId, nombre: 'Test' }];
      mockClienteService.findAll.mockResolvedValue(mockClientes);

      const result = await controller.findAll();

      expect(result).toEqual(mockClientes);
    });

    it('should return clientes with filter', async () => {
      const filter = { nombre: 'Test' };
      const mockClientes = [{ _id: validObjectId, nombre: 'Test' }];
      mockClienteService.findAll.mockResolvedValue(mockClientes);

      const result = await controller.findAll(filter);

      expect(result).toEqual(mockClientes);
      expect(mockClienteService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findBy', () => {
    it('should return clientes matching filter', async () => {
      const filter = { nombre: 'Test' };
      const mockClientes = [{ _id: validObjectId, nombre: 'Test' }];
      mockClienteService.findBy.mockResolvedValue(mockClientes);

      const result = await controller.findBy(filter);

      expect(result).toEqual(mockClientes);
      expect(mockClienteService.findBy).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a cliente by id', async () => {
      const mockCliente = { _id: validObjectId, nombre: 'Test' };
      mockClienteService.findOne.mockResolvedValue(mockCliente);

      const result = await controller.findOne(validObjectId);

      expect(result).toEqual(mockCliente);
      expect(mockClienteService.findOne).toHaveBeenCalledWith(validObjectId);
    });
  });

  describe('update', () => {
    it('should update a cliente', async () => {
      const updateDto: UpdateClienteDto = { nombre: 'Updated' };
      const mockCliente = { _id: validObjectId, nombre: 'Updated' };
      mockClienteService.update.mockResolvedValue(mockCliente);

      const result = await controller.update(validObjectId, updateDto);

      expect(result).toEqual(mockCliente);
      expect(mockClienteService.update).toHaveBeenCalledWith(validObjectId, updateDto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a cliente', async () => {
      mockClienteService.softDelete.mockResolvedValue(undefined);

      await controller.softDelete(validObjectId);

      expect(mockClienteService.softDelete).toHaveBeenCalledWith(validObjectId);
    });
  });
});
